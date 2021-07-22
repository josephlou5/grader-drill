import React, { Component } from "react";
import Question from "./question";
import RubricField from "./rubricField";

class GradingView extends Component {
    constructor(props) {
        super(props);

        let { question } = props;

        if (!question) {
            question = this.getNextUngraded();
            if (!question) {
                this.state = { question: null };
                return;
            }
        }

        if (question.questionType === "Multiple Choice") {
            this.state = {
                question: question,
                score: question.score,
            };
            return;
        }

        let rubric = [...question.rubric];
        for (let i = 0; i < rubric.length; i++) {
            rubric[i]["checked"] = false;
        }
        this.state = {
            question: question,
            rubric: rubric,
            score: 0,
        };
    }

    getNextUngraded = () => {
        const { answered } = this.props;
        if (!answered || answered.length === 0) {
            return null;
        }
        const question = answered.find((q) => !q.graded);
        if (!question) {
            return null;
        }
        return question;
    };

    handleCheckChange = (index) => {
        let rubric = [...this.state.rubric];
        const checked = !rubric[index].checked;
        const multiplier = checked ? 1 : -1;
        rubric[index]["checked"] = checked;
        this.setState({
            rubric: rubric,
            score: this.state.score + multiplier * rubric[index].points,
        });
    };

    handleSave = (assessor, score) => {
        this.props.onGraded(
            this.state.question,
            this.state.rubric,
            assessor,
            score
        );
    };

    handleNext = (assessor, score) => {
        this.handleSave(assessor, score);
        // get next question to be graded
        const question = this.getNextUngraded();
        this.setState({ question });
    };

    renderGradeView = () => {
        const { question } = this.state;

        if (!question) {
            return <h1>Nothing to grade!</h1>;
        }

        // todo: find out the assessor
        const assessor = "jdlou";

        let score = 0;
        if (question.questionType === "Multiple Choice") {
            if (question.answer === question.correct) {
                score = 100;
            }
        } else {
            for (const item of this.state.rubric) {
                if (item.checked) {
                    score += item.points;
                }
            }
        }

        return (
            <div className="row">
                <div>Trainee: {question.trainee}</div>
                <div className="col-6">
                    <Question
                        question={question}
                        noChange={this.props.noChange}
                        {...this.props.eventHandlers}
                    />
                </div>
                <div className="col-6">
                    {"Score: " + score}
                    {question.questionType !== "Multiple Choice" && (
                        <RubricField
                            question={question}
                            onCheckChange={this.handleCheckChange}
                        />
                    )}
                    <div className="position-absolute bottom-0 d-flex justify-content-center">
                        {/* <button type="button" className="btn btn-danger m-2">Skip</button> */}
                        <button
                            type="button"
                            className="btn btn-success m-2"
                            onClick={() => this.handleSave(assessor, score)}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className="btn btn-warning m-2"
                            onClick={() => this.handleNext(assessor, score)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        return (
            <React.Fragment>
                <h1>Grading</h1>
                {this.renderGradeView()}
            </React.Fragment>
        );
    }
}

export default GradingView;
