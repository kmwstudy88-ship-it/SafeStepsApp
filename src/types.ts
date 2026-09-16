export type TextValue = string;

export type Step = {
  text: TextValue;
};

export type Section = {
  title: TextValue;
  steps: Step[];
};

export type Lesson = {
  id: TextValue;
  title: TextValue;
  subtitle: TextValue | null;
  sections: Section[];
};
