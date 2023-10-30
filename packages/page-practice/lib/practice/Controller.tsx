import { keyboardProps, useKeyboard } from "@keybr/keyboard";
import { type Settings } from "@keybr/settings";
import { playSound } from "@keybr/sound";
import { Feedback, PlaySounds, textDisplayProps } from "@keybr/textinput";
import { emulateLayout } from "@keybr/textinput-events";
import { TextInputSound } from "@keybr/textinput-sounds";
import {
  Ctrl,
  handleHotkeys,
  useDocumentEvent,
  useWindowEvent,
} from "@keybr/widget";
import { memo, type ReactNode, useMemo, useState } from "react";
import { type PracticeState } from "./practicestate.ts";
import { Presenter } from "./Presenter.tsx";

export const Controller = memo(function Controller({
  state,
  onConfigure,
}: {
  readonly state: PracticeState;
  readonly onConfigure: () => void;
}): ReactNode {
  const {
    handleResetLesson,
    handleSkipLesson,
    handleKeyDown,
    handleKeyUp,
    handleTextInput,
    hotkeys,
  } = usePracticeState(state);
  useWindowEvent("keydown", hotkeys);
  useWindowEvent("focus", handleResetLesson);
  useWindowEvent("blur", handleResetLesson);
  useDocumentEvent("visibilitychange", handleResetLesson);
  return (
    <Presenter
      state={state}
      lines={state.lines}
      onResetLesson={handleResetLesson}
      onSkipLesson={handleSkipLesson}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onTextInput={handleTextInput}
      onConfigure={onConfigure}
    />
  );
});

function usePracticeState(state: PracticeState) {
  const keyboard = useKeyboard();
  const [lines, setLines] = useState(state.lines); // Forces ui update.

  return useMemo(() => {
    // New lesson.
    setLines(state.lines);
    const handleResetLesson = (): void => {
      state.handleResetLesson();
      setLines(state.lines);
    };
    const handleSkipLesson = (): void => {
      state.handleSkipLesson();
      setLines(state.lines);
    };
    const playSounds = makeSoundPlayer(state.settings);
    const { onKeyDown, onKeyUp, onTextInput } = emulateLayout(
      keyboard,
      {
        onKeyDown: () => {},
        onKeyUp: () => {},
        onTextInput: (codePoint, timeStamp) => {
          state.lastLesson = null;
          const feedback = state.handleTextInput(codePoint, timeStamp);
          setLines(state.lines);
          playSounds(feedback);
        },
      },
      state.settings.get(keyboardProps.emulate),
    );
    return {
      handleResetLesson,
      handleSkipLesson,
      handleKeyDown: onKeyDown,
      handleKeyUp: onKeyUp,
      handleTextInput: onTextInput,
      hotkeys: handleHotkeys(
        ["ArrowLeft", Ctrl, handleResetLesson],
        ["ArrowRight", Ctrl, handleSkipLesson],
        ["Escape", handleResetLesson],
      ),
    };
  }, [state, keyboard]);
}

function makeSoundPlayer(settings: Settings) {
  const playSounds = settings.get(textDisplayProps.playSounds);
  const soundVolume = settings.get(textDisplayProps.soundVolume);
  return (feedback: Feedback): void => {
    if (playSounds === PlaySounds.All) {
      switch (feedback) {
        case Feedback.Succeeded:
        case Feedback.Recovered:
          playSound(TextInputSound.Click, soundVolume);
          break;
        case Feedback.Failed:
          playSound(TextInputSound.Blip, soundVolume);
          break;
      }
    }
    if (playSounds === PlaySounds.ErrorsOnly) {
      switch (feedback) {
        case Feedback.Failed:
          playSound(TextInputSound.Blip, soundVolume);
          break;
      }
    }
  };
}
