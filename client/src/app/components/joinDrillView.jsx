import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Title } from "../shared";
import { addTraineeDrill } from "../api";

export default function JoinDrillView() {
    const [status, setStatus] = useState("Getting drill...");

    const { drillCode } = useParams();

    useEffect(() => {
        addTraineeDrill(drillCode, (drill) => {
            if (!drill.error) {
                setStatus("Successfully joined drill!");
            } else if (drill.notAuthenticated) {
                setStatus("You're not signed in.");
            } else if (drill.uniqueViolation) {
                setStatus("Already in drill!");
            } else if (drill.expiredError) {
                setStatus("Drill has expired.");
            } else {
                setStatus("Invalid drill code.");
            }
        });
    }, [drillCode]);

    return (
        <React.Fragment>
            <Title title="Join Drill" />
            <h1>Join Drill: {drillCode}</h1>
            <p>{status}</p>
        </React.Fragment>
    );
}
