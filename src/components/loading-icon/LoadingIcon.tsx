import React from "react";
import './LoadingIcon.css';

// Courtesy of https://loading.io/css/
class LoadingIcon extends React.Component {
    render() {
        return (
            <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        );
    }
}

export default LoadingIcon;