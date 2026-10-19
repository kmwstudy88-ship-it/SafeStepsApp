import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { useVideoPlayer, VideoView } from 'expo-video';
import { createCarerPortalApi, type CarerCase, type CarerMedia, type MediaReservation, type OperationalCaseId } from './carerPortalApi';
import { submissionUuid, usePortalActor } from './ConnectedCarerPortalScreen';

const MAX_BYTES=25*1024*1024;
const types=['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'];
type Selection={ asset:ImagePicker.ImagePickerAsset;mime:string;size:number;name:string };
export default function CarerMediaScreen() {
  const actor=usePortalActor();
  if (!actor) return <SafeAreaView style={styles.safe}><View style={styles.content}><Text style={styles.heading}>Photos & videos</Text>
    {actor===undefined ? <ActivityIndicator accessibilityLabel="Checking sign-in"/> : <Text style={styles.body}>Sign in to access your private care media.</Text>}
  </View></SafeAreaView>;
  return <MediaWorkspace key={actor} userId={actor}/>;
}
function MediaWorkspace({userId}:{userId:string}) {
  const api=useMemo(()=>createCarerPortalApi(userId),[userId]);
  const [cases,setCases]=useState<CarerCase[]>([]);
  const [caseId,setCaseId]=useState<OperationalCaseId|''>('');
  const [items,setItems]=useState<CarerMedia[]>([]);
  const [selection,setSelection]=useState<Selection|null>(null);
  const [title,setTitle]=useState(''); const [description,setDescription]=useState('');
  const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false);
  const [preview,setPreview]=useState<{id:string;url:string;mime:string}|null>(null);
  const [reviewItem,setReviewItem]=useState<CarerMedia|null>(null);
  const [recipients,setRecipients]=useState<{id:string;displayName:string;memberReference:string}[]>([]);
  const [recipient,setRecipient]=useState(''); const [reason,setReason]=useState('');
  const [originalConfirmed,setOriginalConfirmed]=useState(false);
  const [days,setDays]=useState<7|14|30>(7);
  const alive=useRef(true); const locked=useRef(false); const revision=useRef(0);
  const reservation=useRef<MediaReservation|null>(null); const uploadId=useRef<string|null>(null);
  async function refresh() {
    const current=++revision.current;
    setLoading(true); setItems([]); setCases([]); setPreview(null); setError('');
    setReviewItem(null);setRecipients([]);setRecipient('');setReason('');setOriginalConfirmed(false);
    const results=await Promise.allSettled([api.listCases(),api.listMedia()]);
    if (!alive.current || current!==revision.current) return;
    if (results[0].status==='fulfilled') setCases(results[0].value.cases);
    if (results[1].status==='fulfilled') setItems(results[1].value.media);
    else setError(errorMessage(results[1].reason));
    if (results[0].status==='rejected' && results[1].status==='fulfilled') setNotice('Assigned-case uploads are unavailable. Existing authorized media can still be viewed.');
    setLoading(false);
  }
  useEffect(()=>{
    alive.current=true; void refresh();
    const subscription=AppState.addEventListener('change',state=>{if(state==='active' && !locked.current) void refresh();});
    return ()=>{alive.current=false;++revision.current;subscription.remove();};
  },[api]);
  async function action(run:()=>Promise<void>) {
    if(locked.current) return;
    locked.current=true;setBusy(true);setError('');setNotice('');
    try {await run();} catch(e) {if(alive.current) setError(errorMessage(e));}
    finally {locked.current=false;if(alive.current)setBusy(false);}
  }
  async function pick() {
    await action(async()=>{
      const picked=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images','videos'],allowsEditing:false,quality:1,
        preferredAssetRepresentationMode:ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
        videoExportPreset:ImagePicker.VideoExportPreset.Passthrough});
      if(!alive.current || picked.canceled || !picked.assets[0]) return;
      const asset=picked.assets[0];const name=asset.fileName || `care-${asset.type==='video'?'video.mp4':'photo.jpg'}`;
      const mime=asset.mimeType || ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',mov:'video/quicktime'} as Record<string,string>)[name.split('.').pop()?.toLowerCase() || ''];
      const size=asset.file?.size ?? asset.fileSize ?? new File(asset.uri).size;
      if(!types.includes(mime) || !size || size>MAX_BYTES) throw new Error('Choose a JPEG, PNG or WebP photo, or an MP4/MOV video, up to 25 MiB.');
      reservation.current=null;uploadId.current=null;setSelection({asset,mime,size,name});
    });
  }
  function upload() {
    if(!caseId || !cases.some(c=>c.id===caseId) || !selection || !title.trim()) {setError('Choose the assigned case, media and a title first.');return;}
    const selected=selection; const assigned=caseId;
    void action(async()=>{
      const bytes=selected.asset.file ? await selected.asset.file.arrayBuffer() : await new File(selected.asset.uri).arrayBuffer();
      if(!alive.current) return;
      if(bytes.byteLength!==selected.size || bytes.byteLength>MAX_BYTES) throw new Error('The selected file changed. Choose it again before uploading.');
      uploadId.current ??= submissionUuid();
      reservation.current ??= await api.reserveMedia(assigned,{submissionId:uploadId.current,fileName:selected.name,title:title.trim(),description:description.trim(),mimeType:selected.mime,byteSize:bytes.byteLength});
      if(!alive.current) return;
      await api.uploadReserved(reservation.current,bytes);
      if(!alive.current) return;
      await api.completeMedia(reservation.current.id);
      if(!alive.current) return;
      reservation.current=null;uploadId.current=null;setSelection(null);setTitle('');setDescription('');
      await refresh();setNotice('Uploaded privately. The parent cannot view it until an independent worker approves sharing.');
    });
  }
  function clear() {setSelection(null);setTitle('');setDescription('');reservation.current=null;uploadId.current=null;setError('');}
  async function openReview(item:CarerMedia) {
    await action(async()=>{
      const result=await api.mediaRecipients(item.id);if(!alive.current)return;
      setReviewItem(item);setRecipients(result.recipients);setRecipient('');setReason('');setOriginalConfirmed(false);setDays(7);
    });
  }
  function review(decision:'approved'|'rejected') {
    if(!reviewItem || !reason.trim() || (decision==='approved' && (!recipient || !originalConfirmed))) {setError('Confirm original-file sharing, choose the parent and record your review reason.');return;}
    const item=reviewItem;
    void action(async()=>{
      await api.reviewMedia(item.id,{decision,reason:reason.trim(),...(decision==='approved'?{parentUserId:recipient,expiresAt:new Date(Date.now()+days*86400000-1000).toISOString(),originalDisclosureConfirmed:originalConfirmed}:{})});
      if(!alive.current)return;
      setReviewItem(null);setReason('');await refresh();setNotice(decision==='approved'?'Worker approval recorded for the selected parent.':'Parent sharing withdrawn. Previously opened previews expire within one minute. Originals and review history are retained.');
    });
  }
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Link href="/carers" style={styles.link}>Back to Carer Portal</Link><Text style={styles.heading}>Photos & videos</Text>
    <Text style={styles.body}>Private care media stays with the care team until a worker approves sharing with a specific parent.</Text>
    <TouchableOpacity disabled={busy||loading} onPress={()=>void refresh()}><Text style={styles.link}>Refresh media access</Text></TouchableOpacity>
    {error?<Text accessibilityRole="alert" style={styles.error}>{error}{uploadId.current?` Keep the original file. Upload reference: ${uploadId.current}`:''}</Text>:null}
    {notice?<Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>:null}
    {loading?<ActivityIndicator accessibilityLabel="Loading media"/>:null}
    {cases.length>0?<View style={styles.card}><Text style={styles.title}>Add private media</Text>
      <Text style={styles.body}>Choose the case for this child or children.</Text>
      {cases.map(c=><TouchableOpacity key={c.id} disabled={busy||Boolean(reservation.current)} style={[styles.chip,caseId===c.id&&styles.selected]} onPress={()=>{
        if(caseId && c.id!==caseId && (selection||title.trim()||description.trim())) {setError('Clear the current upload draft before changing cases.');return;}
        setCaseId(c.id);
      }}>
        <Text style={styles.link}>{c.title}</Text></TouchableOpacity>)}
      <TextInput accessibilityLabel="Media title" value={title} onChangeText={setTitle} editable={!busy&&!reservation.current} maxLength={160} placeholder="Media title" style={styles.input}/>
      <TextInput accessibilityLabel="Media context" value={description} onChangeText={setDescription} editable={!busy&&!reservation.current} multiline maxLength={2000}
        placeholder="Identify the child or children, when this happened and the relevant context." style={styles.input}/>
      {selection?<><Text style={styles.body}>{selection.name} · {(selection.size/1024/1024).toFixed(1)} MiB</Text>
        {selection.mime.startsWith('image/')?<Image source={{uri:selection.asset.uri}} style={styles.preview}/>:<MediaVideo uri={selection.asset.uri}/>}</>:null}
      <TouchableOpacity disabled={busy||Boolean(reservation.current)} onPress={()=>void pick()}><Text style={styles.link}>Choose photo or video</Text></TouchableOpacity>
      <TouchableOpacity disabled={busy||!cases.some(c=>c.id===caseId)||!selection||!title.trim()} style={styles.primary} onPress={upload}><Text style={styles.primaryText}>{busy?'Working…':'Upload privately'}</Text></TouchableOpacity>
      <Text style={styles.body}>Up to 25 MiB. Originals are retained; parent sharing stays off until worker review.</Text>
    </View>:null}
    {selection||title||description?<TouchableOpacity disabled={busy} onPress={clear}><Text style={styles.link}>Clear upload draft</Text></TouchableOpacity>:null}
    {!loading&&!items.length&&!error?<Text style={styles.body}>No media is currently available to you.</Text>:null}
    {items.map(item=><View key={item.id} style={styles.card}><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.description}</Text>
      <Text style={styles.body}>{new Date(item.createdAt).toLocaleString()} · {item.state==='ready'?item.reviewStatus:'Upload incomplete'} · {item.parentSharing?'Shared with a parent':'Care team only'}</Text>
      {item.state==='ready'?<TouchableOpacity disabled={busy} onPress={()=>void action(async()=>{
        const view=await api.getMediaView(item.id);if(alive.current)setPreview({id:item.id,url:view.url,mime:view.mimeType});
      })}><Text style={styles.link}>Open / refresh preview</Text></TouchableOpacity>:item.isMine?<TouchableOpacity disabled={busy} onPress={()=>void action(async()=>{
        await api.completeMedia(item.id);if(alive.current){await refresh();setNotice('Stored bytes checked. Parent sharing still requires worker approval.');}
      })}><Text style={styles.link}>Retry stored-file verification</Text></TouchableOpacity>:null}
      {preview?.id===item.id?(preview.mime.startsWith('image/')?<Image source={{uri:preview.url,cache:'reload'}} style={styles.preview}/>:<MediaVideo uri={preview.url}/>):null}
      {item.canReview?<TouchableOpacity disabled={busy} onPress={()=>void openReview(item)}><Text style={styles.link}>Review parent sharing</Text></TouchableOpacity>:null}
    </View>)}
    {reviewItem?<View style={styles.card}><Text style={styles.title}>Review: {reviewItem.title}</Text>
      <Text style={styles.body}>Review the original, current contact restrictions and the intended parent. Originals preserve embedded information such as location and device metadata.</Text>
      {recipients.map(p=><TouchableOpacity key={p.id} disabled={busy} style={[styles.chip,recipient===p.id&&styles.selected]} onPress={()=>setRecipient(p.id)}><Text style={styles.link}>{p.displayName} · {p.memberReference}</Text></TouchableOpacity>)}
      {!recipients.length?<Text style={styles.body}>No currently authorized parent recipients are available.</Text>:null}
      <View style={styles.row}>{([7,14,30] as const).map(d=><TouchableOpacity key={d} disabled={busy} style={[styles.chip,days===d&&styles.selected]} onPress={()=>setDays(d)}><Text style={styles.link}>Share for {d} days</Text></TouchableOpacity>)}</View>
      <TextInput accessibilityLabel="Media review reason" value={reason} onChangeText={setReason} editable={!busy} multiline maxLength={2000} placeholder="Record why this original is suitable to share, or why sharing should be withdrawn." style={styles.input}/>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{checked:originalConfirmed}} disabled={busy} onPress={()=>setOriginalConfirmed(v=>!v)}>
        <Text style={styles.body}>{originalConfirmed?'☑':'☐'} I approve disclosing the original, including its embedded metadata, to this parent.</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={busy||!recipient||!reason.trim()||!originalConfirmed} style={styles.primary} onPress={()=>review('approved')}><Text style={styles.primaryText}>Approve original for selected parent</Text></TouchableOpacity>
      <TouchableOpacity disabled={busy||!reason.trim()} onPress={()=>review('rejected')}><Text style={styles.link}>Reject / withdraw all parent sharing</Text></TouchableOpacity>
      <TouchableOpacity disabled={busy} onPress={()=>setReviewItem(null)}><Text style={styles.link}>Close review</Text></TouchableOpacity>
    </View>:null}
  </ScrollView></SafeAreaView>;
}
function MediaVideo({uri}:{uri:string}) {
  const player=useVideoPlayer({uri,useCaching:false},p=>{if(Platform.OS==='ios')p.allowsExternalPlayback=false;});
  return <VideoView player={player} style={styles.preview} nativeControls/>;
}
function errorMessage(e:unknown){return e instanceof Error?e.message:'Unable to access private media.';}
const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F7F6'},content:{padding:20,gap:16,width:'100%',maxWidth:760,alignSelf:'center'},
  heading:{color:'#193E3C',fontSize:26,fontWeight:'800'},title:{color:'#193E3C',fontSize:17,fontWeight:'700'},body:{color:'#536D69',fontSize:14,lineHeight:21},
  card:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#D8E3E1',borderRadius:14,padding:16,gap:12},chip:{padding:10,borderWidth:1,borderColor:'#D8E3E1',borderRadius:10},
  selected:{borderColor:'#08766D',backgroundColor:'#E8F5F2'},link:{color:'#08766D',fontWeight:'700'},input:{borderWidth:1,borderColor:'#CFDCDA',borderRadius:10,padding:12,color:'#203F3D',backgroundColor:'#FFFFFF'},
  primary:{backgroundColor:'#08766D',borderRadius:10,padding:14,alignItems:'center'},primaryText:{color:'#FFFFFF',fontWeight:'700'},preview:{width:'100%',height:240,borderRadius:10},
  row:{flexDirection:'row',flexWrap:'wrap',gap:8},error:{color:'#9D2836',lineHeight:21},notice:{color:'#08766D',lineHeight:21},
});
