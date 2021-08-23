import React from "react";
import { Title } from "../shared";

export default function HelpView() {
    return (
        <React.Fragment>
            <Title title="Help" />
            <h1>Help</h1>

            <h2>General</h2>
            <p>
                If you forgot your password, contact an Admin, who can generate
                a random password for you. You can then log in and change your
                password on the Profile page.
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
                to be answered before it is considered complete.
            </p>

            <h2>Trainee: How can I join a Drill?</h2>
            <p>
                Trainees can join Drills from the Trainee Dashboard or by going
                to a drill's code link (e.g., graderdrills.io/join/drillcode).
            </p>

            <h2>Trainee: How do I answer questions?</h2>
            <p>
                On the Trainee Dashboard, you can see the drills you're in and
                your previously answered questions. To answer questions, go to
                the Training tab, select a Drill, and you will be given
                questions automatically.
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