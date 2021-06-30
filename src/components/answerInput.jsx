import React, { Component } from 'react';

class AnswerInput extends Component {
    render() {
        const answerNum = this.props.index + 1;
        return (
            <form>
                <span className="badge bg-primary m-2">{ answerNum }</span>
                <input id={"answer-" + answerNum} />
                { this.props.highlight.byUser && 
                    <button
                        type="button"
                        className="btn btn-close m-1"
                        aria-label="Delete"
                        onClick={() => this.props.onDelete(this.props.index)}
                    />
                }
                { "{startLine: " + this.props.highlight["startLine"] + ", " +
                    "startChar: " + this.props.highlight["startChar"] + ", " +
                    "endLine: " + this.props.highlight["endLine"] + ", " +
                    "endchar: " + this.props.highlight["endChar"] + "}" }
            </form>
        );
    }
}
 
export default AnswerInput;
