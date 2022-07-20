import React from 'react';
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import LoadingIcon from "components/loading-icon/LoadingIcon";
import Hiragana from "../../utility/hiragana";
import {
    Box,
    Button,
    createTheme, CssBaseline, Link,
    Popover,
    Tab,
    Tabs, ThemeProvider,
    ToggleButton,
    ToggleButtonGroup, Tooltip
} from "@mui/material";
import {DataGrid, GridRowsProp, GridColDef} from '@mui/x-data-grid';
import CharacterCheckboxes from "../character-checkboxes/CharacterCheckboxes";
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';

const columns: GridColDef[] = [
    { field: 'reading', headerName: 'Reading', minWidth: 250, flex: 0 },
    { field: 'kanji', headerName: 'Kanji', minWidth: 250, flex: 0 },
    { field: 'meaning', headerName: 'Meaning', flex: 1 }
];

const DICT_URL = "https://raw.githubusercontent.com/kazeraniman/japanese-vocab-tool/main/src/resources/FilteredJMdict.json";

const DARK_MODE_SETTING_LOCAL_STORAGE_KEY = "darkModeSetting";
const SELECTED_HIRAGANA_LOCAL_STORAGE_KEY = "selectedHiragana";

const LIGHT_THEME = "light";
const DARK_THEME = "dark";
const AUTO_THEME = "auto";

const darkTheme = createTheme({
    palette: {
        mode: DARK_THEME
    }
});

const lightTheme = createTheme({
    palette: {
        mode: LIGHT_THEME
    }
});

interface IProps {
}

interface IState {
    isLoaded: boolean;
    wordList: any[];
    filteredWordList: GridRowsProp[];
    selectedHiragana: { [name: string]: boolean };
    charSets: { [name: string]: Set<string> };
    hiraganaTableTab: number;
    darkModeSetting: string;
    isDarkMode: boolean;
}

class App extends React.Component<IProps, IState> {
    darkModePreference: string;

    constructor(props: any) {
        super(props);

        this.darkModePreference = LIGHT_THEME;
        let previouslySelectedCharacters: { [name: string]: boolean } = JSON.parse(localStorage.getItem(SELECTED_HIRAGANA_LOCAL_STORAGE_KEY) || "{}");
        let initiallySelectedCharacters: { [name: string]: boolean } = Object.assign({}, ...Array.from(Hiragana.HiraganaSet).map((character) => ({[character]: previouslySelectedCharacters[character] == null ? true : previouslySelectedCharacters[character]})));
        let darkModeSetting = localStorage.getItem(DARK_MODE_SETTING_LOCAL_STORAGE_KEY) || this.darkModePreference;

        this.state = {
            isLoaded: false,
            wordList: [],
            filteredWordList: [],
            selectedHiragana: initiallySelectedCharacters,
            charSets: {},
            hiraganaTableTab: 0,
            darkModeSetting: darkModeSetting,
            isDarkMode: darkModeSetting === DARK_THEME
        };

        this.applyFilter = this.applyFilter.bind(this);
        this.filterWordList = this.filterWordList.bind(this);
        this.charactersChangedHandler = this.charactersChangedHandler.bind(this);
        this.hiraganaCheckboxTabChangedHandler = this.hiraganaCheckboxTabChangedHandler.bind(this);
        this.darkModeChangedHandler = this.darkModeChangedHandler.bind(this);
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
        localStorage.setItem(SELECTED_HIRAGANA_LOCAL_STORAGE_KEY, JSON.stringify(this.state.selectedHiragana));
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

    darkModeChangedHandler(event: React.MouseEvent<HTMLElement>, nextMode: string) {
        if (nextMode === null) {
            return;
        }

        localStorage.setItem(DARK_MODE_SETTING_LOCAL_STORAGE_KEY, nextMode);
        this.setState({
            darkModeSetting: nextMode,
            isDarkMode: nextMode === DARK_THEME
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
                <ThemeProvider theme={this.state.isDarkMode ? darkTheme : lightTheme}>
                    <CssBaseline />
                    <div className="App">
                        <LoadingIcon />
                    </div>
                </ThemeProvider>
            );
        }

        return (
            <ThemeProvider theme={this.state.isDarkMode ? darkTheme : lightTheme}>
                <CssBaseline />
                <div className="App">
                    <div className="AppContents">
                        <div>
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={this.state.darkModeSetting}
                                onChange={this.darkModeChangedHandler}
                            >
                                <ToggleButton value={LIGHT_THEME}><Tooltip title="Light Mode" arrow><LightModeIcon /></Tooltip></ToggleButton>
                                <ToggleButton value={AUTO_THEME}><Tooltip title="System Light/Dark Mode Setting" arrow><SettingsIcon /></Tooltip></ToggleButton>
                                <ToggleButton value={DARK_THEME}><Tooltip title="Dark Mode" arrow><DarkModeIcon /></Tooltip></ToggleButton>
                            </ToggleButtonGroup>
                        </div>
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
                                                    <Tab label="Diacritical Mark Hiragana" />
                                                    <Tab label="Small Hiragana" />
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
                                                        characterRows={Hiragana.DiacriticalMarkHiraganaRows}
                                                        previouslySelectedCharacters={this.state.selectedHiragana}
                                                        charactersChangedCallback={this.charactersChangedHandler}
                                                    />
                                                }
                                                { this.state.hiraganaTableTab === 2 &&
                                                    <CharacterCheckboxes
                                                        characterRows={Hiragana.SmallHiraganaRows}
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
                        <span className="JMDict-Attribution">This site uses the <Link target="_blank" rel="noreferrer" href="http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project">JMdict/EDICT</Link> and <Link target="_blank" rel="noreferrer" href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project">KANJIDIC</Link> dictionary files. These files are the property of the <Link target="_blank" rel="noreferrer" href="http://www.edrdg.org/">Electronic Dictionary Research and Development Group</Link>, and are used in conformance with the Group's <Link target="_blank" rel="noreferrer" href="http://www.edrdg.org/edrdg/licence.html">licence</Link>.</span>
                    </footer>
                </div>
            </ThemeProvider>
        );
    }
}

export default App;
