import React from 'react';
import './App.css';
import LoadingIcon from "components/loading-icon/LoadingIcon";
import Hiragana from "../../utility/hiragana";
import {Box, Button, Popover, Tab, Tabs} from "@mui/material";
import {DataGrid, GridRowsProp, GridColDef} from '@mui/x-data-grid';
import CharacterCheckboxes from "../character-checkboxes/CharacterCheckboxes";
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';

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
    hiraganaTableTab: number;
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
            charSets: {},
            hiraganaTableTab: 0
        };

        this.applyFilter = this.applyFilter.bind(this);
        this.filterWordList = this.filterWordList.bind(this);
        this.charactersChangedHandler = this.charactersChangedHandler.bind(this);
        this.hiraganaCheckboxTabChangedHandler = this.hiraganaCheckboxTabChangedHandler.bind(this);
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

    hiraganaCheckboxTabChangedHandler(event: React.SyntheticEvent, newValue: number) {
        this.setState({
            hiraganaTableTab: newValue
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
                    <PopupState variant="popover" popupId="FilterPopover">
                            {(popupState) => (
                                <div>
                                    <Box sx={{ m: 1 }}>
                                        <Button variant="contained" {...bindTrigger(popupState)}>
                                            Filters
                                        </Button>
                                    </Box>
                                    <Popover
                                        {...bindPopover(popupState)}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'center',
                                        }}
                                    >
                                        <div className="HiraganaCheckboxes">
                                            <Tabs value={this.state.hiraganaTableTab} onChange={this.hiraganaCheckboxTabChangedHandler} centered>
                                                <Tab label="Main Hiragana" />
                                                <Tab label="Additional Hiragana" />
                                                <Tab label="Special Hiragana" />
                                            </Tabs>
                                            { this.state.hiraganaTableTab === 0 &&
                                                <CharacterCheckboxes
                                                    characterRows={Hiragana.MainHiraganaRows}
                                                    previouslySelectedCharacters={this.state.selectedHiragana}
                                                    charactersChangedCallback={this.charactersChangedHandler}
                                                />
                                            }
                                            { this.state.hiraganaTableTab === 1 &&
                                                <CharacterCheckboxes
                                                    characterRows={Hiragana.AdditionalHiraganaRows}
                                                    previouslySelectedCharacters={this.state.selectedHiragana}
                                                    charactersChangedCallback={this.charactersChangedHandler}
                                                />
                                            }
                                            { this.state.hiraganaTableTab === 2 &&
                                                <CharacterCheckboxes
                                                    characterRows={Hiragana.SpecialHiraganaRows}
                                                    previouslySelectedCharacters={this.state.selectedHiragana}
                                                    charactersChangedCallback={this.charactersChangedHandler}
                                                />
                                            }
                                            <div className="ApplyFilterButton">
                                                <Button variant="contained" onClick={this.applyFilter}>Apply Filter</Button>
                                            </div>
                                        </div>
                                    </Popover>
                                </div>
                            )}
                        </PopupState>
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
