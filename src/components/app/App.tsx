import React from 'react';
import './App.css';
import LoadingIcon from "components/loading-icon/LoadingIcon";
import Hiragana from "../../utility/hiragana";
import {
    Button,
    Checkbox,
    createTheme,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableRow,
    ThemeProvider
} from "@mui/material";
import {DataGrid, GridRowsProp, GridColDef} from '@mui/x-data-grid';

interface IProps {
}

interface IState {
    isLoaded: boolean;
    wordList: any[];
    filteredWordList: GridRowsProp[];
    selectedHiragana: { [name: string]: boolean };
    charSets: { [name: string]: Set<string> }
}

const columns: GridColDef[] = [
    { field: 'reading', headerName: 'Reading', minWidth: 250, flex: 0 },
    { field: 'kanji', headerName: 'Kanji', minWidth: 250, flex: 0 },
    { field: 'meaning', headerName: 'Meaning', flex: 1 }
];

const tableTheme = createTheme({
    components: {
        MuiTable: {
            styleOverrides: {
                root: {
                    "maxWidth": '600px',
                    "display": "inline-table"
                },
            },
        },
    },
});

class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        let pastSelectedHiragana : { [name: string]: boolean } = JSON.parse(localStorage.getItem("selectedHiragana") || "{}");

        this.state = {
            isLoaded: false,
            wordList: [],
            filteredWordList: [],
            selectedHiragana: Object.assign({}, ...Array.from(Hiragana.HiraganaSet).map((character) => ({[character]: pastSelectedHiragana[character] === null ? true : pastSelectedHiragana[character]}))),
            charSets: {}
        };

        this.hiraganaCheckboxChangeHandler = this.hiraganaCheckboxChangeHandler.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.filterWordList = this.filterWordList.bind(this);
    }

    componentDidMount() {
        let charSets: { [name: string]: Set<string> } = {};
        fetch("https://raw.githubusercontent.com/kazeraniman/japanese-vocab-tool/main/src/resources/FilteredJMdict.json")
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

    hiraganaCheckboxChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            selectedHiragana: {...this.state.selectedHiragana, [event.target.name]: event.target.checked}
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
                        <ThemeProvider theme={tableTheme}>
                            <Table className="HiraganaTable" size="small">
                                <TableBody>
                                    {
                                        Hiragana.MainHiraganaRows.map((row) => {
                                            return <TableRow className="HiraganaCheckboxRow" key={"hiragana-row-checkbox-row-" + row[0]}>
                                                {/*<TableCell className="HiraganaCheckboxCell">*/}
                                                {/*    <Checkbox key={"hiragana-row-checkbox-" + row[0]}/>*/}
                                                {/*</TableCell>*/}
                                                {
                                                    row.map((character, index) => <TableCell className="HiraganaCheckboxCell" key={"hiragana-cell-checkbox-" + row[0] + "-" + index}>{character != null && <FormControlLabel
                                                        control={<Checkbox key={"hiragana-checkbox-" + character} name={character} checked={this.state.selectedHiragana[character]} onChange={this.hiraganaCheckboxChangeHandler}/>}
                                                        label={character}/>}</TableCell>)
                                                }
                                            </TableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </ThemeProvider>
                        <Button variant="contained" onClick={this.applyFilter}>Apply Filter</Button>
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
                            }}
                            disableSelectionOnClick
                            pageSize={25}
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
