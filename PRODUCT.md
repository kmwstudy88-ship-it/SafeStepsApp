# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

SafeSteps primarily supports parents and caregivers referred for parenting support, including people navigating child-safety and reunification processes. Parents and caregivers may also use the learning tools voluntarily without a referral. Practitioners and supervisors use separate case, review, and reporting surfaces to support families.

## Product Purpose

SafeSteps helps families build safer parenting skills, understand requirements, practise difficult interactions, record progress, and prepare useful evidence of change. Success means parents can apply practical child-safe behaviours while retaining meaningful control over sensitive reflections and progress sharing.

## Positioning

SafeSteps combines trauma-informed learning, practical rehearsal, consent-aware progress records, and human-reviewed child-safety workflows in one family-support platform. Automated outputs are decision support and learning guidance, not clinical, legal, placement, custody, or contact decisions.

## Operating Context

The product is an Expo app used on mobile and web, backed by a canonical curriculum library, device-local/offline capabilities, and Supabase for authenticated records. Referred learners may have an assigned practitioner. Course progress may be shared with that practitioner only after the learner gives explicit consent; private reflections are not part of progress sharing by default.

## Capabilities and Constraints

- Canonical curriculum content is authored in `lessons/`, `modules/`, and `topics/`.
- Structured learning records use the existing `learning_*` Supabase domain rather than parallel course or identity models.
- Learning content must offer pass, pause, and support options and must not compel disclosure.
- Safety concerns route to human support and applicable safeguarding procedures.
- Certificates show course completion, not parenting fitness, clinical clearance, or legal compliance.
- The Understanding Harm course is a production draft and must not be described as validated or approved before safeguarding, cultural, clinical, legal, and lived-experience review.

## Brand Commitments

The product name is SafeSteps. Copy is plain-language, respectful, non-shaming, practical, and child-safety focused. The interface must preserve the established calm blue, teal, white, and slate visual system used by the current app.

## Evidence on Hand

- Canonical learning and safeguarding content in `lessons/`, `modules/`, and `topics/`.
- Structured learning schema and RLS foundations in `supabase/migrations/20260721190229_parenting_child_development_learning_engine_volume16_completion.sql`.
- Existing local assessment, scenario, storybook, safety, and coaching prototypes in `app/` and `lib/`.
- The Understanding Harm course supplied for this work is a production draft. No validation, approval, effectiveness claim, testimonial, or accreditation evidence is on hand.

## Product Principles

- Put immediate child and family safety before lesson completion.
- Build accountability without shame, coercion, or forced disclosure.
- Make the next safe action concrete and achievable.
- Keep automated guidance transparent, bounded, and reviewable by people.
- Give learners control over what progress is shared and with whom.

## Accessibility & Inclusion

Use plain language, readable contrast, scalable text, large touch targets, screen-reader labels, reduced-motion-safe interactions, and alternatives to written reflection. Content should support different family structures, ages, cultures, literacy levels, disability needs, and participation choices without treating one parenting programme as universally suitable.
