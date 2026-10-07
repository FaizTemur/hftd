'use client';
import {Canvas,useFrame} from '@react-three/fiber';import {useMemo,useRef} from 'react';
function Core(){const g=useRef(),a=useRef(),b=useRef();
 useFrame((s)=>{const t=s.clock.elapsedTime,m=s.pointer,y=scrollY/innerHeight;
  g.current.rotation.y=t*.15+m.x*.7;g.current.rotation.x=m.y*.4+y*.5;a.current.rotation.x=t*.4;b.current.rotation.y=-t*.3;
  g.current.position.y=Math.min(y,3)*1.6;g.current.position.x=Math.sin(y*1.3)*2.2;g.current.scale.setScalar(1+Math.min(y,3)*.25);
  s.camera.position.x+=(m.x*1.4-s.camera.position.x)*.05;s.camera.position.y+=(m.y*.8-s.camera.position.y)*.05;s.camera.lookAt(0,0,0)});
 return <group ref={g}>
  <mesh><icosahedronGeometry args={[1.7,1]}/><meshBasicMaterial color="#00ff9c" wireframe transparent opacity={.45}/></mesh>
  <mesh><icosahedronGeometry args={[1.1,0]}/><meshStandardMaterial color="#07070b" emissive="#7c3aed" emissiveIntensity={.9} metalness={1} roughness={.25} flatShading/></mesh>
  <mesh ref={a}><torusGeometry args={[2.5,.02,8,140]}/><meshBasicMaterial color="#22d3ee"/></mesh>
  <mesh ref={b} rotation={[1.2,0,0]}><torusGeometry args={[3.1,.015,8,140]}/><meshBasicMaterial color="#a855f7"/></mesh>
  {[...Array(8)].map((_,i)=><mesh key={i} position={[Math.cos(i*.785)*3.8,Math.sin(i*1.9)*1.6,Math.sin(i*.785)*3.8]} rotation={[i,i*2,0]}><boxGeometry args={[.5,.5,.06]}/><meshBasicMaterial color={i%2?'#00ff9c':'#22d3ee'} wireframe/></mesh>)}
 </group>}
function Stars(){const r=useRef();const p=useMemo(()=>{const a=new Float32Array(2400*3);for(let i=0;i<a.length;i++)a[i]=(Math.random()-.5)*(i%3===2?40:26);return a},[]);
 useFrame((s)=>{r.current.rotation.y=s.clock.elapsedTime*.02+s.pointer.x*.12;r.current.rotation.x=s.pointer.y*.06+scrollY*.0004});
 return <points ref={r}><bufferGeometry><bufferAttribute attach="attributes-position" args={[p,3]}/></bufferGeometry><pointsMaterial size={.035} color="#9dffe0" transparent opacity={.75}/></points>}
export default function Scene(){return <div className="scene"><Canvas dpr={[1,innerWidth<700?1:1.5]} camera={{position:[0,0,8],fov:55}} gl={{antialias:false,powerPreference:'high-performance'}}>
 <fog attach="fog" args={['#030405',8,26]}/><ambientLight intensity={.3}/><pointLight position={[4,3,4]} color="#22d3ee" intensity={60}/><pointLight position={[-4,-2,3]} color="#8b5cf6" intensity={60}/>
 <Core/><Stars/><gridHelper args={[70,70,'#00ff9c','#0a3324']} position={[0,-4,0]}/></Canvas></div>}
