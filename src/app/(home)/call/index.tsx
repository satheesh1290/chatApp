import { Text } from "react-native";
import {
  CallContent,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { environment } from "../../../../environment";
import VideoProvider from "../../../providers/VideoProvider";

const callId = "default_51e0d5f2-950b-4041-a93c-48275afb31c2";

export default function CallScreen() {
  const client = useStreamVideoClient();
  const call = client.call("default", callId);
  call.join({ create: true });

  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
}
