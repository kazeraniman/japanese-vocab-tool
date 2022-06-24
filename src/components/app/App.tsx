import React from 'react';
import './App.css';
import LoadingIcon from "components/loading-icon/LoadingIcon";
import Hiragana from "../../utility/hiragana";

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
        let intermediarySet = new Set<string>();

        jmDict.forEach(function(entry: any) {
            if ("r_ele" in entry && entry.r_ele.length > 0 && "reb" in entry.r_ele[0] && entry.r_ele[0].reb.length > 0) {
                entry.r_ele[0].reb.forEach(function(word: string) {
                   let charSet = new Set<string>(word.split(""));
                   let setDiff = new Set([...charSet].filter(x => !Hiragana.HiraganaSet.has(x)));
                   if (setDiff.size === 0) {
                       intermediarySet.add(word);
                   }
                });
            }
        });

        this.setState({
            isLoaded: true,
            wordList: Array.from(intermediarySet).sort()
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
