import React from "react";
import { Title } from "../shared";

export default function AboutView() {
    return (
        <React.Fragment>
            <Title title="About" />
            <h1>About</h1>
            <p>
                Grader Drill is a research project by Joseph Lou and Jérémie
                Lumbroso at Princeton University. It is aimed to help train
                graders in coding courses to give clear, valuable feedback to
                students.
            </p>
        </React.Fragment>
    );
}
