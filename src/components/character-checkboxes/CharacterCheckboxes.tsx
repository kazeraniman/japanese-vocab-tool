import React from "react";
import './CharacterCheckboxes.css';
import {
    Checkbox,
    createTheme,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableRow,
    ThemeProvider
} from "@mui/material";

const tableTheme = createTheme({
    components: {
        MuiTable: {
            styleOverrides: {
                root: {
                    "maxWidth": '600px',
                    "display": "block"
                },
            },
        },
    },
});

interface IProps {
    characterRows: (string | null)[][];
    previouslySelectedCharacters : { [name: string]: boolean };
    charactersChangedCallback: (changedCharacters: { [name: string]: boolean }) => void;
}

interface IState {
    selectedCharacters: { [name: string]: boolean };
}

class CharacterCheckboxes extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        let initiallySelectedCharacters: { [name: string]: boolean } = {};
        this.props.characterRows.forEach(row => {
            row.forEach(character => {
                if (character != null) {
                    initiallySelectedCharacters[character] = this.props.previouslySelectedCharacters[character];
                }
            });
        });

        this.state = {
            selectedCharacters: initiallySelectedCharacters
        };

        this.characterCheckboxChangeHandler = this.characterCheckboxChangeHandler.bind(this);
        this.characterRowCheckboxChangeHandler = this.characterRowCheckboxChangeHandler.bind(this);
        this.characterAllCheckboxChangeHandler = this.characterAllCheckboxChangeHandler.bind(this);
    }

    characterCheckboxChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            selectedCharacters: {...this.state.selectedCharacters, [event.target.name]: event.target.checked}
        }, () => this.props.charactersChangedCallback(this.state.selectedCharacters));
    }

    characterRowCheckboxChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        let newSelectedCharacters = {...this.state.selectedCharacters};
        this.props.characterRows[parseInt(event.target.value)].forEach(character => {
            if (character != null) {
                newSelectedCharacters[character] = event.target.checked;
            }
        });

        this.setState({
            selectedCharacters: newSelectedCharacters
        }, () => this.props.charactersChangedCallback(this.state.selectedCharacters));
    }

    characterAllCheckboxChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        let newSelectedCharacters : { [name: string]: boolean } = {};
        Object.keys(this.state.selectedCharacters).forEach(key => newSelectedCharacters[key] = event.target.checked);

        this.setState({
            selectedCharacters: newSelectedCharacters
        }, () => this.props.charactersChangedCallback(this.state.selectedCharacters));
    }

    render() {
        return (
            <div className="CharacterCheckboxes">
                <ThemeProvider theme={tableTheme}>
                    <Table className="CharacterTable" size="small">
                        <TableBody>
                            {
                                this.props.characterRows.map((row, index) => {
                                    return <TableRow className="CharacterCheckboxRow" key={"character-row-checkbox-row-" + index}>
                                        <TableCell className="CharacterCheckboxCell">
                                            <Checkbox
                                                value={index}
                                                checked={row.every((character) => character == null || this.state.selectedCharacters[character])}
                                                indeterminate={row.some(character => character != null && this.state.selectedCharacters[character] !== (this.state.selectedCharacters[String(row.find(element => element != null))]))}
                                                onChange={this.characterRowCheckboxChangeHandler}
                                            />
                                        </TableCell>
                                        {
                                            row.map((character, index) => <TableCell className="CharacterCheckboxCell" key={"character-cell-checkbox-" + row[0] + "-" + index}>{character != null && <FormControlLabel
                                                control={<Checkbox key={"character-checkbox-" + character} name={character} checked={this.state.selectedCharacters[character]} onChange={this.characterCheckboxChangeHandler}/>}
                                                label={character}/>}</TableCell>)
                                        }
                                    </TableRow>
                                })
                            }
                        </TableBody>
                    </Table>
                </ThemeProvider>
                <Checkbox className="CharacterAllCheckbox"
                          checked={Object.values(this.state.selectedCharacters).every(value => value)}
                          indeterminate={new Set(Object.values(this.state.selectedCharacters)).size === 2}
                          onChange={this.characterAllCheckboxChangeHandler}
                />
            </div>
        );
    }
}

export default CharacterCheckboxes;