import React from "react";
import { Typography } from "@mui/joy";
import { PoemLineType, PoemCustomText } from "../../../_types/Types";

interface LineProps {
  line: PoemLineType;
}

const Line: React.FC<LineProps> = ({ line }) => {
  return (
    <Typography
      component="div"
      style={{
        marginLeft: "20px",
        textAlign: line.alignment || "left",
      }}
    >
      {line.children.map((textNode: PoemCustomText, index: number) => (
        <span
          key={index}
          style={{
            fontWeight: textNode.bold ? "bold" : "normal",
            fontStyle: textNode.italic ? "italic" : "normal",
            textDecoration: textNode.underline ? "underline" : "none",
          }}
        >
          {textNode.text}
        </span>
      ))}
    </Typography>
  );
};

export default Line;
