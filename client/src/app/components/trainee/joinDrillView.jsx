import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Title } from "app/shared";
import { addTraineeDrill } from "app/api";

export default function JoinDrillView() {
    const [status, setStatus] = useState("Getting drill...");
    const [success, setSuccess] = useState(false);

    const { drillCode } = useParams();

    useEffect(() => {
        addTraineeDrill(drillCode, (drill) => {
            if (!drill.error) {
                setStatus("Successfully joined drill!");
                setSuccess(true);
            } else if (drill.uniqueViolation) {
                setStatus("Already in drill!");
                setSuccess(true);
            } else if (drill.expiredError) {
                setStatus("Drill has expired.");
            } else {
                setStatus("Invalid drill code.");
            }
        });
    }, [drillCode]);

    const trainButton = (
        <Link to="/training">
            <button type="button" className="btn btn-success">
                Training
            </button>
        </Link>
    );

    return (
        <React.Fragment>
            <Title title="Join Drill" />
            <h1>Join Drill: {drillCode}</h1>
            <p>{status}</p>
            {success && trainButton}
        </React.Fragment>
    );
}
