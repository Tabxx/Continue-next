import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  defaultBorderRadius,
  lightGray,
  vscButtonBackground,
  vscButtonForeground,
} from "../../../components";
import Spinner from "../../../components/markdown/StepContainerPreToolbar/Spinner";
import { IdeMessengerContext } from "../../../context/IdeMessenger";
import { streamUpdate } from "../../../redux/slices/stateSlice";
import {
  acceptToolCall,
  cancelToolCall,
  setCalling,
} from "../../../redux/slices/toolCallSlice";
import { RootState } from "../../../redux/store";

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  margin: 8px;
`;

const Button = styled.button`
  padding: 5px;
  border-radius: ${defaultBorderRadius};
  flex: 1;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;

const AcceptButton = styled(Button)`
  color: ${vscButtonForeground};
  border: none;
  background-color: ${vscButtonBackground};
  color: ${vscButtonForeground};

  &:hover {
    cursor: pointer;
  }
`;

const RejectButton = styled(Button)`
  color: ${lightGray};
  border: 1px solid ${lightGray};
  background-color: transparent;
`;

interface ToolCallButtonsProps {}

export function ToolCallButtons(props: ToolCallButtonsProps) {
  const dispatch = useDispatch();
  const toolCallState = useSelector((store: RootState) => store.toolCallState);
  const ideMessenger = useContext(IdeMessengerContext);

  async function callTool() {
    // If it goes "generated" -> "calling" -> "done" really quickly
    // we don't want an abrupt flash so just skip "calling"
    let setCallingState = true;

    const timer = setTimeout(() => {
      if (setCallingState) {
        dispatch(setCalling());
      }
    }, 800);

    if (toolCallState.currentToolCallState !== "generated") {
      return;
    }

    const result = await ideMessenger.request("tools/call", {
      toolCall: toolCallState.toolCall,
    });

    setCallingState = false;
    clearTimeout(timer);

    if (result.status === "success") {
      dispatch(
        streamUpdate({
          role: "tool",
          content: JSON.stringify(result.content.result),
          toolCallId: toolCallState.toolCall.id,
        }),
      );

      dispatch(acceptToolCall());
    }
  }

  return (
    <>
      <ButtonContainer>
        {toolCallState.currentToolCallState === "generating" ? (
          <div
            className="flex w-full items-center justify-center gap-4"
            style={{
              color: lightGray,
              minHeight: "40px",
            }}
          >
            Thinking...
          </div>
        ) : toolCallState.currentToolCallState === "generated" ? (
          <>
            <RejectButton onClick={() => dispatch(cancelToolCall())}>
              Cancel
            </RejectButton>
            <AcceptButton onClick={callTool}>Continue</AcceptButton>
          </>
        ) : toolCallState.currentToolCallState === "calling" ? (
          <div className="ml-auto flex items-center gap-4">
            Loading...
            <Spinner />
          </div>
        ) : null}
      </ButtonContainer>
    </>
  );
}
