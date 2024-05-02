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
            }, index * 1000); // Espera 500ms entre cada nota
        });
    };

    const playNoteAndHighlight = (midiNumber) => {
        // Reproduce la nota
        console.log('Reproduciendo nota:', midiNumber);

        setHighlightedNotes((prevNotes) => [...prevNotes, midiNumber]);
        setTimeout(() => {
            setHighlightedNotes((prevNotes) => prevNotes.filter((note) => note !== midiNumber));
        }, 800); // Apaga el resaltado después de 300ms
    };

    const handleUserTurn = () => {
        setUserTurn(true);
        setUserSequence([]);
    };

    const handleUserSequence = (midiNumber) => {
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
        <div className="bg-gradient-to-r from-slate-400 via-slate-900 to-slate-400 font-mono">
            <div className="min-w-screen min-h-screen flex flex-col justify-center items-center">

                <div className="text-7xl mb-11 text-white">
                    <h1 className="hover:text-orange-300">Piano Game Test</h1>
                </div>
                
                <ResponsivePiano className="PianoDarkTheme" activeNotes={highlightedNotes}
                                 onPlayNote={handleUserSequence}/>
                

                <div className="flex flex-row mt-5 w-full">
                    <div className="w-2/5 flex flex-col gap-4 items-center">
                        <button onClick={playRandomSequence}
                                className="text-orange-300 bg-gray-700 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded w-1/2 hover:shadow-lg hover:shadow-orange-300">Reproducción Aleatoria
                        </button>
                        <button onClick={handleUserTurn}
                                className="text-orange-300 bg-gray-700 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded w-1/2 hover:shadow-lg hover:shadow-orange-300">Tu Turno
                        </button>
                    </div>
                    <div className="w-2/5 flex flex-col gap-4 items-center">
                        <button onClick={compareSequences}
                                className="text-orange-300 bg-gray-700 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded w-1/2 hover:shadow-lg hover:shadow-orange-300">Comprobar Errores
                        </button>
                        <button onClick={resetErrorCount}
                                className="text-orange-300 bg-gray-700 hover:bg-gray-500 hover:text-white font-bold py-2 px-4 rounded w-1/2 hover:shadow-lg hover:shadow-orange-300">Reiniciar Contador
                        </button>
                    </div>
                    <div className="w-1/5 flex items-center">
                        <h1 className="text-5xl text-purple-950 hover:text-orange-300">Errores: {errorCount}</h1>
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
