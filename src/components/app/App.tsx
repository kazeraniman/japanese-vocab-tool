import React from 'react';
import './App.css';
import LoadingIcon from "components/loading-icon/LoadingIcon";

interface IProps {
}

interface IState {
    isLoaded: boolean;
    wordList: any[];
}

class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            isLoaded: false,
            wordList: []
        }
    }

    componentDidMount() {
        let jmDict = require('resources/JMdict.json');
        let intermediaryList: any[] = [];
        let i = 0;

        jmDict.forEach(function(entry: any) {
            if (i < 10 && "r_ele" in entry && entry.r_ele.length > 0 && "reb" in entry.r_ele[0] && entry.r_ele[0].reb.length > 0) {
                intermediaryList.push(...entry.r_ele[0].reb);
                i++;
            }
        });

        this.setState({
            isLoaded: true,
            wordList: intermediaryList
        });
    }

    render() {
        if (!this.state.isLoaded) {
            return (
                <div className="App">
                    <LoadingIcon />
                </div>
            );
        }

        return (
            <div className="App">
                <div className="AppContents">
                    <ul>
                        {this.state.wordList.map((word) => <li key={word}>{word}</li>)}
                    </ul>
                </div>
                <footer className="MainFooter">
                    <span className="JMDict-Attribution">This site uses the <a href="http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project">JMdict/EDICT</a> and <a href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project">KANJIDIC</a> dictionary files. These files are the property of the <a href="http://www.edrdg.org/">Electronic Dictionary Research and Development Group</a>, and are used in conformance with the Group's <a href="http://www.edrdg.org/edrdg/licence.html">licence</a>.</span>
                </footer>
            </div>
        );
    }
}

export default App;
