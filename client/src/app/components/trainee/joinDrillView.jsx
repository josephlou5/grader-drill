import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Title } from "app/shared";
import { addTraineeDrill } from "app/api";

export default function JoinDrillView() {
    const [{ status, success, drillId }, setState] = useState({
        status: "Getting drill...",
        success: false,
    });

    const { drillCode } = useParams();

    useEffect(() => {
        addTraineeDrill(drillCode).then((drill) => {
            if (!drill.error) {
                setState({
                    status: "Successfully joined drill!",
                    success: true,
                    drillId: drill.drillId,
                });
            } else if (drill.uniqueViolation) {
                setState({
                    status: "Already in drill!",
                    success: true,
                    drillId: drill.drillId,
                });
            } else {
                setState({
                    status: "Invalid drill code.",
                    success: false,
                });
            }
        });
    }, [drillCode]);

    let link = "/training";
    if (success && drillId != null) {
        link += "/drill/" + drillId;
    }
    const trainButton = (
        <Link to={link}>
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
