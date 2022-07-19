import React from 'react';
import './App.css';
import LoadingIcon from "components/loading-icon/LoadingIcon";
import Hiragana from "../../utility/hiragana";
import { Button } from "@mui/material";
import {DataGrid, GridRowsProp, GridColDef} from '@mui/x-data-grid';
import CharacterCheckboxes from "../character-checkboxes/CharacterCheckboxes";

const columns: GridColDef[] = [
    { field: 'reading', headerName: 'Reading', minWidth: 250, flex: 0 },
    { field: 'kanji', headerName: 'Kanji', minWidth: 250, flex: 0 },
    { field: 'meaning', headerName: 'Meaning', flex: 1 }
];

const DICT_URL = "https://raw.githubusercontent.com/kazeraniman/japanese-vocab-tool/main/src/resources/FilteredJMdict.json";

interface IProps {
}

interface IState {
    isLoaded: boolean;
    wordList: any[];
    filteredWordList: GridRowsProp[];
    selectedHiragana: { [name: string]: boolean };
    charSets: { [name: string]: Set<string> };
}

class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        let previouslySelectedCharacters: { [name: string]: boolean } = JSON.parse(localStorage.getItem("selectedHiragana") || "{}");
        let initiallySelectedCharacters: { [name: string]: boolean } = Object.assign({}, ...Array.from(Hiragana.HiraganaSet).map((character) => ({[character]: previouslySelectedCharacters[character] == null ? true : previouslySelectedCharacters[character]})));

        this.state = {
            isLoaded: false,
            wordList: [],
            filteredWordList: [],
            selectedHiragana: initiallySelectedCharacters,
            charSets: {}
        };

        this.applyFilter = this.applyFilter.bind(this);
        this.filterWordList = this.filterWordList.bind(this);
        this.charactersChangedHandler = this.charactersChangedHandler.bind(this);
    }

    componentDidMount() {
        let charSets: { [name: string]: Set<string> } = {};
        fetch(DICT_URL)
            .then(response => response.json())
            .then(jmDict => {
                jmDict.forEach(function(entry: any) {
                    let word = entry["reading"];
                    charSets[word] = new Set<string>(word.split(""));
                });

                this.setState({
                    wordList: jmDict,
                    charSets: charSets
                }, this.filterWordList);
            });
    }

    applyFilter() {
        localStorage.setItem("selectedHiragana", JSON.stringify(this.state.selectedHiragana));
        this.setState({
            isLoaded: false
        }, this.filterWordList);
    }

    charactersChangedHandler(changedCharacters: { [name: string]: boolean }): void {
        this.setState({
            selectedHiragana: {...this.state.selectedHiragana, ...changedCharacters}
        });
    }

    filterWordList() {
        let allowableCharacters = new Set<string>(Object.keys(this.state.selectedHiragana).filter(key => this.state.selectedHiragana[key]));
        this.setState({
            filteredWordList: this.state.wordList.filter(word => new Set([...this.state.charSets[word["reading"]]].filter(x => !allowableCharacters.has(x))).size === 0),
            isLoaded: true
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
                    <div className="HiraganaCheckboxes">
                        <CharacterCheckboxes
                            characterRows={Hiragana.MainHiraganaRows}
                            previouslySelectedCharacters={this.state.selectedHiragana}
                            charactersChangedCallback={this.charactersChangedHandler}
                        />
                        <CharacterCheckboxes
                            characterRows={Hiragana.AdditionalHiraganaRows}
                            previouslySelectedCharacters={this.state.selectedHiragana}
                            charactersChangedCallback={this.charactersChangedHandler}
                        />
                        <CharacterCheckboxes
                            characterRows={Hiragana.SpecialHiraganaRows}
                            previouslySelectedCharacters={this.state.selectedHiragana}
                            charactersChangedCallback={this.charactersChangedHandler}
                        />
                        <div className="ApplyFilterButton">
                            <Button variant="contained" onClick={this.applyFilter}>Apply Filter</Button>
                        </div>
                    </div>
                    <div className="WordTable">
                        <DataGrid
                            rows={this.state.filteredWordList}
                            columns={columns}
                            sortingOrder={['asc', 'desc']}
                            initialState={{
                                sorting: {
                                    sortModel: [{ field: 'reading', sort: 'asc' }],
                                },
                                pagination: {
                                    pageSize: 25,
                                }
                            }}
                            disableSelectionOnClick
                        />
                    </div>
                </div>
                <footer className="MainFooter">
                    <span className="JMDict-Attribution">This site uses the <a href="http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project">JMdict/EDICT</a> and <a href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project">KANJIDIC</a> dictionary files. These files are the property of the <a href="http://www.edrdg.org/">Electronic Dictionary Research and Development Group</a>, and are used in conformance with the Group's <a href="http://www.edrdg.org/edrdg/licence.html">licence</a>.</span>
                </footer>
            </div>
        );
    }
}

export default App;
