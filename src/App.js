import React, { useState } from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

import DimensionsProvider from './DimensionsProvider';
import SoundfontProvider from './SoundfontProvider';
import './styles.css';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const noteRange = {
    first: MidiNumbers.fromNote('c3'),
    last: MidiNumbers.fromNote('f4'),
};
const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: noteRange.first,
    lastNote: noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

function App() {
    const [highlightedNotes, setHighlightedNotes] = useState([]);
    const [randomSequence, setRandomSequence] = useState([]);
    const [userSequence, setUserSequence] = useState([]);
    const [errorCount, setErrorCount] = useState(0);
    const [userTurn, setUserTurn] = useState(false);

    const playRandomSequence = () => {
        const newSequence = [];
        for (let i = 0; i < 5; i++) {
            const randomNote = Math.floor(Math.random() * (noteRange.last - noteRange.first + 1)) + noteRange.first;
            newSequence.push(randomNote);
        }

        setRandomSequence(newSequence);
        playSequence(newSequence);
    };

    const playSequence = (sequence) => {
        sequence.forEach((note, index) => {
            setTimeout(() => {
                playNoteAndHighlight(note);
            }, index * 500); // Espera 500ms entre cada nota
        });
    };

    const playNoteAndHighlight = (midiNumber) => {
        // Reproduce la nota
        console.log('Reproduciendo nota:', midiNumber);
        // Aquí deberías llamar a tu función playNote() para reproducir la nota

        // Destaca la tecla
        setHighlightedNotes((prevNotes) => [...prevNotes, midiNumber]);
        setTimeout(() => {
            setHighlightedNotes((prevNotes) => prevNotes.filter((note) => note !== midiNumber));
        }, 300); // Apaga el resaltado después de 300ms
    };

    const handleUserTurn = () => {
        setUserTurn(true);
        setUserSequence([]); // Reinicia la secuencia del usuario
    };

    const handleUserSequence = (midiNumber) => {
        // Si es el turno del usuario, añadir la nota seleccionada por el usuario al estado
        if (userTurn) {
            setUserSequence((prevSequence) => [...prevSequence, midiNumber]);
        }
    };

    const compareSequences = () => {
        let errors = 0;
        for (let i = 0; i < randomSequence.length; i++) {
            if (randomSequence[i] !== userSequence[i]) {
                errors++;
            }
        }
        setErrorCount(errors);
    };

    const resetErrorCount = () => {
        setErrorCount(0);
    };

    return (
        <div>
            <div className="min-w-screen min-h-screen flex flex-col justify-center items-center">
                <ResponsivePiano className="PianoDarkTheme" activeNotes={highlightedNotes}
                                 onPlayNote={handleUserSequence}/>
                <div className="flex flex-row">
                    <div className="w-2/5">
                        <button onClick={playRandomSequence}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Reproducir
                            secuencia aleatoria
                        </button>
                        <button onClick={handleUserTurn}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Tu
                            turno
                        </button>
                    </div>
                    <div className="w-2/5">
                        <button onClick={compareSequences}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Comprobar
                            errores
                        </button>
                        <button onClick={resetErrorCount}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Reiniciar
                            contador de errores
                        </button>
                    </div>
                    <div className="w-1/5">
                        <h1>Errores: {errorCount}</h1>
                    </div>

                </div>
            </div>


        </div>
    );
}

function ResponsivePiano(props) {
    return (
        <DimensionsProvider>
            {({containerWidth, containerHeight}) => (
                <SoundfontProvider
                    instrumentName="acoustic_grand_piano"
                    audioContext={audioContext}
                    hostname={soundfontHostname}
                    render={({ isLoading, playNote, stopNote }) => (
                        <Piano
                            noteRange={noteRange}
                            width={containerWidth}
                            playNote={(midiNumber) => {
                                playNote(midiNumber);
                                props.onPlayNote && props.onPlayNote(midiNumber);
                            }}
                            stopNote={stopNote}
                            disabled={isLoading}
                            keyboardShortcuts={keyboardShortcuts}
                            {...props}
                        />
                    )}
                />
            )}
        </DimensionsProvider>
    );
}

export default App;
