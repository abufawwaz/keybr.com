import { type Layout } from "@keybr/layout";
import {
  type TextDisplaySettings,
  type TextInputSettings,
} from "@keybr/textinput-settings";
import { type LessonType } from "./lessontype.ts";
import { type SpeedUnit } from "./units.ts";

export type LayoutSettings = {
  readonly layout: Layout;
  readonly emulateLayout: boolean;
};

export type LessonSettings = {
  readonly lessonType: LessonType;
  readonly lessonComplexity: number;
  readonly lessonLength: number;
  readonly lessonCapitals: boolean;
  readonly lessonPunctuators: boolean;
  readonly wordListSize: number;
  readonly textContent: string;
  readonly textSimplify: boolean;
  readonly textLowercase: boolean;
  readonly textRandomize: boolean;
  readonly benford: boolean;
  readonly dailyGoal: number;
};

export type UiSettings = {
  readonly speedUnit: SpeedUnit;
};

export type AllSettings = LayoutSettings &
  LessonSettings &
  TextInputSettings &
  TextDisplaySettings &
  UiSettings;
