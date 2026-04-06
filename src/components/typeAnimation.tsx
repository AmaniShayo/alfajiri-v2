"use client";

import { TypeAnimation } from "react-type-animation";
import React from "react";
type Sequence = Array<SequenceElement>;
type SequenceElement =
  | string
  | number
  | ((element: HTMLElement | null) => void | Promise<void>);

const TypeAnimate: React.FC<{ sequence: Sequence }> = ({ sequence }) => {
  return (
    <TypeAnimation
      sequence={sequence}
      wrapper="span"
      speed={50}
      repeat={Infinity}
    />
  );
};

export default TypeAnimate;
