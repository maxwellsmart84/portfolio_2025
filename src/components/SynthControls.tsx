'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export default function SynthControls() {
  const [filterValue, setFilterValue] = useState(50);
  const [volumeValue, setVolumeValue] = useState(75);
  const [modWheelValue, setModWheelValue] = useState(0);
  const [pitchWheelValue, setPitchWheelValue] = useState(50);
  const [selectedWaveform, setSelectedWaveform] = useState('sine');
  const [sequencerRunning, setSequencerRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  // Tone.js refs
  const oscillatorRef = useRef<Tone.Oscillator | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const sequenceRef = useRef<Tone.Sequence | null>(null);

  const waveforms = [
    { type: 'sine', label: '~', color: 'cyan' },
    { type: 'sawtooth', label: '∠', color: 'purple' },
    { type: 'square', label: '⊓', color: 'pink' },
    { type: 'triangle', label: '∆', color: 'yellow' },
  ];

  // Initialize Tone.js components
  useEffect(() => {
    // Create audio chain: Oscillator -> Filter -> Volume -> Destination
    const filter = new Tone.Filter(1000, 'lowpass').toDestination();
    const volume = new Tone.Volume(-12).connect(filter);
    const oscillator = new Tone.Oscillator(220, 'sine').connect(volume);

    filterRef.current = filter;
    volumeRef.current = volume;
    oscillatorRef.current = oscillator;

    // Create a simple sequence
    const sequence = new Tone.Sequence(
      (time, note) => {
        if (oscillatorRef.current) {
          oscillatorRef.current.frequency.setValueAtTime(note, time);
        }
      },
      ['C4', 'E4', 'G4', 'C5'],
      '4n'
    );

    sequenceRef.current = sequence;

    return () => {
      // Cleanup
      oscillator.dispose();
      filter.dispose();
      volume.dispose();
      sequence.dispose();
    };
  }, []);

  // Start audio context (requires user interaction)
  const startAudio = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setAudioStarted(true);
      console.log('Audio context started');
    }
  };

  // Update oscillator waveform
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = selectedWaveform as Tone.ToneOscillatorType;
    }
  }, [selectedWaveform]);

  // Update filter frequency (20Hz to 20kHz)
  useEffect(() => {
    if (filterRef.current) {
      const frequency = 20 + (filterValue / 100) * 19980; // 20Hz to 20kHz
      filterRef.current.frequency.value = frequency;
    }
  }, [filterValue]);

  // Update volume (-60dB to 0dB)
  useEffect(() => {
    if (volumeRef.current) {
      const volume = -60 + (volumeValue / 100) * 60; // -60dB to 0dB
      volumeRef.current.volume.value = volume;
    }
  }, [volumeValue]);

  // Update oscillator frequency with pitch wheel
  useEffect(() => {
    if (oscillatorRef.current) {
      const basePitch = 220; // A3
      const pitchBend = ((pitchWheelValue - 50) / 50) * 2; // -2 to +2 semitones
      const frequency = basePitch * Math.pow(2, pitchBend / 12);
      oscillatorRef.current.frequency.value = frequency;
    }
  }, [pitchWheelValue]);

  // Handle sequencer
  useEffect(() => {
    if (sequenceRef.current) {
      if (sequencerRunning && audioStarted) {
        Tone.Transport.start();
        sequenceRef.current.start(0);
      } else {
        Tone.Transport.stop();
        sequenceRef.current.stop(0);
      }
    }
  }, [sequencerRunning, audioStarted]);

  // Toggle oscillator on/off
  const toggleOscillator = async () => {
    await startAudio();

    if (oscillatorRef.current) {
      if (isPlaying) {
        oscillatorRef.current.stop();
        setIsPlaying(false);
      } else {
        oscillatorRef.current.start();
        setIsPlaying(true);
      }
    }
  };

  const Knob = ({
    value,
    onChange,
    size = 'md',
    label,
    color = 'cyan',
  }: {
    value: number;
    onChange: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    label: string;
    color?: string;
  }) => {
    const sizes = {
      sm: 'w-16 h-16',
      md: 'w-20 h-20',
      lg: 'w-32 h-32',
    };

    const rotation = (value / 100) * 270 - 135; // -135° to 135°

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={`${sizes[size]} relative rounded-full border-2 bg-gray-800 border-${color}-500 shadow-[0_0_10px_${color}] cursor-pointer`}
        >
          <div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-inner"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
              const normalizedAngle = ((((angle * 180) / Math.PI + 135) % 360) + 360) % 360;
              const newValue = Math.max(0, Math.min(100, (normalizedAngle / 270) * 100));
              onChange(newValue);
            }}
          >
            <motion.div
              className={`absolute top-1 left-1/2 h-6 w-1 bg-${color}-400 origin-bottom rounded-full`}
              style={{
                transform: `translateX(-50%) rotate(${rotation}deg)`,
                transformOrigin: '50% 100%',
              }}
            />
          </div>
        </div>
        <span className={`font-arcade text-xs text-${color}-300`}>{label}</span>
      </div>
    );
  };

  const Slider = ({
    value,
    onChange,
    label,
    color = 'cyan',
    vertical = true,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
    color?: string;
    vertical?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-2">
      <span className={`font-arcade text-xs text-${color}-300`}>{label}</span>
      <div
        className={`${vertical ? 'h-32 w-6' : 'h-6 w-32'} border bg-gray-800 border-${color}-500 relative rounded-full`}
      >
        <motion.div
          className={`absolute h-4 w-4 bg-${color}-400 rounded-full border border-${color}-300 cursor-pointer shadow-[0_0_8px_${color}]`}
          style={
            vertical
              ? { top: `${100 - value}%`, left: '50%', transform: 'translate(-50%, -50%)' }
              : { left: `${value}%`, top: '50%', transform: 'translate(-50%, -50%)' }
          }
          drag={vertical ? 'y' : 'x'}
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          onDrag={(_, info) => {
            if (vertical) {
              const newValue = Math.max(0, Math.min(100, 100 - (info.point.y / 128) * 100));
              onChange(newValue);
            } else {
              const newValue = Math.max(0, Math.min(100, (info.point.x / 128) * 100));
              onChange(newValue);
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-arcade mb-8 text-center text-2xl text-cyan-400">MOOG GRANDMOTHER</h2>

      <div className="rounded-2xl border-2 border-cyan-500 bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-[0_0_30px_cyan]">
        {/* Audio Start Notice */}
        {!audioStarted && (
          <div className="mb-6 rounded-lg border border-yellow-500 bg-yellow-900/20 p-4 text-center">
            <p className="font-arcade text-sm text-yellow-300">Click any control to start audio</p>
          </div>
        )}

        {/* Top Row - Wheels */}
        <div className="mb-8 flex items-start justify-between">
          <Slider value={modWheelValue} onChange={setModWheelValue} label="MOD" color="purple" />

          <Slider
            value={pitchWheelValue}
            onChange={setPitchWheelValue}
            label="PITCH"
            color="pink"
          />
        </div>

        {/* Center Row - Main Controls */}
        <div className="mb-8 flex items-center justify-center gap-12">
          <Knob
            value={volumeValue}
            onChange={setVolumeValue}
            size="md"
            label="VOLUME"
            color="purple"
          />

          {/* Giant Filter Knob */}
          <Knob
            value={filterValue}
            onChange={setFilterValue}
            size="lg"
            label="FILTER"
            color="cyan"
          />

          {/* Waveform Selector */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-arcade text-xs text-yellow-300">WAVEFORM</span>
            <div className="grid grid-cols-2 gap-2">
              {waveforms.map(wave => (
                <motion.button
                  key={wave.type}
                  className={`h-12 w-12 rounded border-2 font-mono text-lg font-bold transition-all ${
                    selectedWaveform === wave.type
                      ? `border-${wave.color}-400 bg-${wave.color}-400/20 text-${wave.color}-300 shadow-[0_0_10px_${wave.color}]`
                      : `border-gray-600 bg-gray-800 text-gray-400 hover:border-${wave.color}-500`
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedWaveform(wave.type)}
                >
                  {wave.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Oscillator Control */}
        <div className="mb-6 flex justify-center">
          <motion.button
            className={`font-arcade rounded-lg border-2 px-8 py-4 text-lg transition-all ${
              isPlaying
                ? 'border-red-400 bg-red-400/20 text-red-300 shadow-[0_0_15px_red]'
                : 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_15px_cyan]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleOscillator}
          >
            {isPlaying ? 'STOP OSC' : 'START OSC'}
          </motion.button>
        </div>

        {/* Bottom Row - Sequencer */}
        <div className="flex items-center justify-center gap-4">
          <span className="font-arcade text-sm text-cyan-300">SEQUENCER</span>
          <motion.button
            className={`font-arcade rounded-lg border-2 px-6 py-3 text-sm transition-all ${
              sequencerRunning
                ? 'border-red-400 bg-red-400/20 text-red-300 shadow-[0_0_15px_red]'
                : 'border-green-400 bg-green-400/20 text-green-300 shadow-[0_0_15px_green]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSequencerRunning(!sequencerRunning)}
          >
            {sequencerRunning ? 'STOP' : 'START'}
          </motion.button>

          {/* Tempo Display */}
          <div className="ml-4 flex items-center gap-2">
            <span className="font-arcade text-xs text-purple-300">BPM</span>
            <div className="rounded border border-purple-400 bg-black px-3 py-1 font-mono text-purple-300">
              120
            </div>
          </div>
        </div>

        {/* Status LEDs */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-3 w-3 rounded-full ${audioStarted ? 'bg-cyan-400' : 'bg-gray-600'}`}
              animate={audioStarted ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-arcade text-xs text-cyan-300">AUDIO</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-3 w-3 rounded-full ${isPlaying ? 'bg-yellow-400' : 'bg-gray-600'}`}
              animate={isPlaying ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-arcade text-xs text-yellow-300">OSC</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-3 w-3 rounded-full ${sequencerRunning ? 'bg-green-400' : 'bg-gray-600'}`}
              animate={sequencerRunning ? { opacity: [1, 0, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <span className="font-arcade text-xs text-green-300">SEQ</span>
          </div>
        </div>

        {/* Real-time Parameter Display */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-600 pt-4">
          <div className="text-center">
            <div className="font-arcade text-xs text-cyan-300">FILTER</div>
            <div className="font-mono text-lg text-cyan-400">
              {Math.round(20 + (filterValue / 100) * 19980)} Hz
            </div>
          </div>
          <div className="text-center">
            <div className="font-arcade text-xs text-purple-300">VOLUME</div>
            <div className="font-mono text-lg text-purple-400">
              {Math.round(-60 + (volumeValue / 100) * 60)} dB
            </div>
          </div>
          <div className="text-center">
            <div className="font-arcade text-xs text-pink-300">PITCH</div>
            <div className="font-mono text-lg text-pink-400">
              {Math.round(220 * Math.pow(2, (((pitchWheelValue - 50) / 50) * 2) / 12))} Hz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
