"use client";
import { motion } from "framer-motion";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 -z-20">
        <Canvas>
          <Stars
            radius={300}
            depth={80}
            count={30000}
            factor={5}
            saturation={1}
            fade
            speed={2}
          />
        </Canvas>
      </div>

      {/* Nebula Glows */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/30 blur-[200px] rounded-full top-0 left-0 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-fuchsia-500/30 blur-[200px] rounded-full bottom-0 right-20 animate-pulse"></div>
      <div className="absolute w-[450px] h-[450px] bg-indigo-500/30 blur-[180px] rounded-full top-1/3 right-1/3 animate-pulse"></div>

      {/* Floating Planet */}
      <motion.img
        src="https://i.imgur.com/5QFQ7QB.png"
        alt="Planet"
        className="absolute w-[320px] top-10 right-10 opacity-90"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* UFO Passing By */}
      <motion.img
        src="https://i.imgur.com/fb1dJvA.png"
        alt="UFO"
        className="absolute w-40 top-40 left-[-200px] drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
        initial={{ x: -300, y: 40, rotate: -10 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          delay: 2,
          repeatDelay: 5,
        }}
      />

      {/* Comet */}
      <motion.div
        className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_25px_white]"
        initial={{ x: -200, y: -100 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeIn" }}
      ></motion.div>

      {/* Hologram HUD */}
      <motion.div
        className="absolute top-20 left-20 text-cyan-300 text-sm font-mono bg-cyan-300/10 border border-cyan-300/30 p-4 rounded-xl backdrop-blur-xl shadow-[0_0_25px_rgba(0,255,255,0.5)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <p>GALACTIC ERROR: 404</p>
        <p>LOCATION: UNKNOWN SECTOR</p>
        <p>STATUS: COSMIC DRIFT</p>
        <p>RECOMMENDATION: RETURN TO ORIGIN</p>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 min-h-screen">
        {/* Main 404 */}
        <motion.h1
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-[180px] font-extrabold tracking-widest drop-shadow-[0_0_25px_rgba(255,0,255,0.8)]"
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 text-2xl max-w-2xl opacity-80"
        >
          This path has collapsed into a black hole. What you seek is no longer
          in this dimension.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex items-center gap-6"
        >
          <Link
            href="/"
            className="px-8 py-4 rounded-2xl bg-white text-black font-semibold shadow-[0_0_25px_rgba(255,255,255,1)] hover:scale-110 transition-transform"
          >
            Return Home
          </Link>

          <div className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 font-semibold shadow-[0_0_40px_rgba(140,0,255,0.9)] hover:scale-110 transition-transform cursor-pointer">
            Travel Further
          </div>
        </motion.div>

        {/* Floating Astronaut */}
        <motion.img
          src="https://i.imgur.com/1ZQZ1Zr.png"
          alt="Astronaut"
          initial={{ y: -20 }}
          animate={{ y: 20 }}
          transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
          className="w-64 opacity-90 mt-20 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
        />

        <div className="absolute bottom-8 text-sm opacity-40">
          Lost in Space © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
