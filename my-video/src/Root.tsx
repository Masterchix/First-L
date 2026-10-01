import "./index.css";
import { Composition } from "remotion";
import { Ad } from "./Ad";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FurAd"
        component={Ad}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
