import React, {useEffect, useState} from 'react';
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

function App() {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [wordList, setWordList] = useState<any[]>([]);
    const [filteredWordList, setFilteredWordList] = useState<GridRowsProp[]>([]);
    const [selectedHiragana, setSelectedHiragana] = useState<{ [name: string]: boolean }>({});
    const [charSets, setCharSets] = useState<{ [name: string]: Set<string> }>({});
    const [hiraganaTableTab, setHiraganaTableTab] = useState<number>(0);
    const [darkModeSetting, setDarkModeSetting] = useState<string>("light");
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    // Initial Construction
    useEffect(() => {
        let darkModePreference = LIGHT_THEME;
        let previouslySelectedCharacters: { [name: string]: boolean } = JSON.parse(localStorage.getItem(SELECTED_HIRAGANA_LOCAL_STORAGE_KEY) || "{}");
        let initiallySelectedCharacters: { [name: string]: boolean } = Object.assign({}, ...Array.from(Hiragana.HiraganaSet).map((character) => ({[character]: previouslySelectedCharacters[character] == null ? true : previouslySelectedCharacters[character]})));
        let initialDarkModeSetting = localStorage.getItem(DARK_MODE_SETTING_LOCAL_STORAGE_KEY) || darkModePreference;

        setSelectedHiragana(initiallySelectedCharacters);
        setDarkModeSetting(initialDarkModeSetting);
        setIsDarkMode(initialDarkModeSetting === DARK_THEME)

        let initialCharSets: { [name: string]: Set<string> } = {};
        fetch(DICT_URL)
            .then(response => response.json())
            .then(jmDict => {
                jmDict.forEach(function(entry: any) {
                    let word = entry["reading"];
                    initialCharSets[word] = new Set<string>(word.split(""));
                });

                setWordList(jmDict);
                setCharSets(initialCharSets)

                // TODO: This is a duplicated fragment. Need to understand hooks and their dependencies more before I can remove it. More info: https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies
                let allowableCharacters = new Set<string>(Object.keys(initiallySelectedCharacters).filter(key => initiallySelectedCharacters[key]));
                setFilteredWordList(jmDict.filter((word: {[name: string]: any }) => new Set([...initialCharSets[word["reading"]]].filter(x => !allowableCharacters.has(x))).size === 0));
                setIsLoaded(true);
            });
    }, []);

    function applyFilter() {
        localStorage.setItem(SELECTED_HIRAGANA_LOCAL_STORAGE_KEY, JSON.stringify(selectedHiragana));
        setIsLoaded(false);
        filterWordList();
    }

    function charactersChangedHandler(changedCharacters: { [name: string]: boolean }): void {
        setSelectedHiragana({...selectedHiragana, ...changedCharacters});
    }

    function hiraganaCheckboxTabChangedHandler(event: React.SyntheticEvent, newValue: number) {
        setHiraganaTableTab(newValue);
    }

    function darkModeChangedHandler(event: React.MouseEvent<HTMLElement>, nextMode: string) {
        if (nextMode === null) {
            return;
        }

        localStorage.setItem(DARK_MODE_SETTING_LOCAL_STORAGE_KEY, nextMode);
        setDarkModeSetting(nextMode);
        setIsDarkMode(nextMode === DARK_THEME)
    }

    function filterWordList() {
        let allowableCharacters = new Set<string>(Object.keys(selectedHiragana).filter(key => selectedHiragana[key]));
        setFilteredWordList(wordList.filter(word => new Set([...charSets[word["reading"]]].filter(x => !allowableCharacters.has(x))).size === 0));
        setIsLoaded(true);
    }

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <div className="App">
                {
                    !isLoaded
                    ? (
                        <LoadingIcon />
                    )
                    : (
                        <div className="AppContents">
                            <div className="AppContents">
                                <div>
                                    <ToggleButtonGroup
                                        size="small"
                                        exclusive
                                        value={darkModeSetting}
                                        onChange={darkModeChangedHandler}
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
                                                    <Tabs value={hiraganaTableTab} onChange={hiraganaCheckboxTabChangedHandler} centered>
                                                        <Tab label="Main Hiragana" />
                                                        <Tab label="Diacritical Mark Hiragana" />
                                                        <Tab label="Small Hiragana" />
                                                    </Tabs>
                                                    { hiraganaTableTab === 0 &&
                                                        <CharacterCheckboxes
                                                            characterRows={Hiragana.MainHiraganaRows}
                                                            previouslySelectedCharacters={selectedHiragana}
                                                            charactersChangedCallback={charactersChangedHandler}
                                                        />
                                                    }
                                                    { hiraganaTableTab === 1 &&
                                                        <CharacterCheckboxes
                                                            characterRows={Hiragana.DiacriticalMarkHiraganaRows}
                                                            previouslySelectedCharacters={selectedHiragana}
                                                            charactersChangedCallback={charactersChangedHandler}
                                                        />
                                                    }
                                                    { hiraganaTableTab === 2 &&
                                                        <CharacterCheckboxes
                                                            characterRows={Hiragana.SmallHiraganaRows}
                                                            previouslySelectedCharacters={selectedHiragana}
                                                            charactersChangedCallback={charactersChangedHandler}
                                                        />
                                                    }
                                                    <div className="ApplyFilterButton">
                                                        <Button variant="contained" onClick={applyFilter}>Apply Filter</Button>
                                                    </div>
                                                </div>
                                            </Popover>
                                        </div>
                                    )}
                                </PopupState>
                                <div className="WordTable">
                                    <DataGrid
                                        rows={filteredWordList}
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
                    )
                }
            </div>
        </ThemeProvider>
    );
}

export default App;
