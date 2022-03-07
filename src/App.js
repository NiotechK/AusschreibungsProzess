import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css';
import Ausschreibung from './artifacts/contracts/AusschreibungKontrakte.sol/AusschreibungsErstellung.json'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'


function App() {
  const [ausschreibungsende, setAuschreibungsende] = useState (0)
  const [produktname, setProduktname] = useState ('')
  const [greeting, setGreetingValue] = useState()
  const [ausschreibungadresse, fetchAusschreibungAdresse] = useState()
  const greeterAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c"
  const ausAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d"
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts'});
  }

/*
  async function fetchGreeting() {
    // Überprüfung ob Metamask installiert ist oder ob der User es verwendet
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
    try {
      const data = await contract.greet()
      console.log('data: ', data)
      window.alert("Contract Adresse: ", data)
    } catch (err) {
      console.log("Error: ", err)
    }

  }

  async function setGreeting() {
    //Überprüung, ob etwas in das Feld geschrieben worden ist
    if(!greeting) return
    // Überprüfung ob Metamask installiert ist 
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract =new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      setGreetingValue('')
      await transaction.wait()
      fetchGreeting()
    }
  }

  <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input onChange={e => setGreetingValue(e.target.value)} 
        placeholder="Set greeting"
        value={greeting} />
*/
    

  async function ausschreibungErstellen() {
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract =new ethers.Contract(ausAddress, Ausschreibung.abi, signer);
      const transaction = await contract.erstellungAusschreibung(produktname, ausschreibungsende);
      setAuschreibungsende('')
      setProduktname('')
      await transaction.wait()
    }
  }

  async function fetchA() {
     // Überprüfung ob Metamask installiert ist oder ob der User es verwendet
     const provider = new ethers.providers.Web3Provider(window.ethereum)
     const contract = new ethers.Contract(ausAddress, Ausschreibung.abi, provider)
     try {
       const data = await contract.getVal(ausschreibungadresse)
       console.log('data: ', data)
       document.getElementById("CA").innerHTML = data;
     } catch (err) {
       console.log("Error: ", err)
     }
  }



  return (
    <div className="App">
      <header className="App-header">
  
      <h1>Ausschreibungsprozess</h1>
        <button onClick={ausschreibungErstellen}>Ausschreibung erstellen </button>
        <input
          onChange={e => setAuschreibungsende(e.target.value)}
          placeholder="Auschreibungsende"
          value={ausschreibungsende}
          />
        <input
          onChange={e => setProduktname(e.target.value)}
          placeholder="Produktname"
          value={produktname}
          />
          <button onClick={fetchA}>fetchen</button>
          <input
          onChange={e => fetchAusschreibungAdresse(e.target.value)}
          placeholder="ausschreibung Adresse"
          value={ausschreibungadresse}
          />
        <p>Contract Adresse:</p>
        <p id="CA">...</p>
      </header>
    </div>
  );
}

export default App;
