import React from "react";
import { Title } from "app/shared";

export default function HelpView() {
    return (
        <React.Fragment>
            <Title title="Help" />
            <h1>Help</h1>

            <h2>General</h2>
            <p>
                Logging in is through Princeton CAS. Your username is your
                netid.
            </p>

            <h2>Roles</h2>
            <p>
                Admin: Manages Users, Questions, and Drills (only an Admin can
                promote a user to an Admin)
            </p>
            <p>Assessor: Can grade answered questions</p>
            <p>Trainee: Can join Drills and answer questions</p>

            <h2>What are Drills?</h2>
            <p>
                Drills are "assignments" represented by a set of questions (set
                by an Admin). Each Drill requires a certain number of questions
                to be answered before a set due date.
            </p>

            <h2>Trainee: How can I join a Drill?</h2>
            <p>
                Trainees can join Drills from the Trainee Dashboard or by going
                to a drill's code link (e.g.,
                http://graderdrills.io/join/drillcode).
            </p>

            <h2>Trainee: How do I answer questions?</h2>
            <p>
                On the Trainee Dashboard, you can see the drills you're in and
                your previously answered questions. To answer questions, go to
                the Training tab, select a Drill, and you will be given
                questions automatically.
            </p>
            <p>
                For "Comment" questions, you will have to highlight portions of
                the code according to the prompt and then write corresponding
                comments for each highlight. (This mimics the grading on{" "}
                <a
                    href="https://codepost.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    codepost.io
                </a>
                .)
            </p>
            <p>
                For "Highlight" questions, you only need to highlight portions
                of the code without writing corresponding comments.
            </p>
            <p>
                For "Multiple Choice" questions, you will select the answer you
                think is the most correct. It is still possible to highlight
                portions of the code, which you might have to do depending on
                the question prompt.
            </p>

            <h2>Assessor: How do I grade questions?</h2>
            <p>
                On the Assessor Dashboard, you can see your graded questions and
                all of the answered questions. To grade questions, go to the
                Grading tab, and you will be given questions automatically.
                Check the items on the rubric which are satisfied by the
                trainee's answer.
            </p>
            <p>
                You can regrade a question by clicking the "Regrade" button when
                viewing the question.
            </p>
            <p>Note that Multiple Choice questions are auto-graded.</p>
        </React.Fragment>
    );
}
