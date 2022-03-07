pragma solidity ^0.8.3; 

import "hardhat/console.sol";
// SPDX-License-Identifier: GPL-3.0
contract ausschreibung {
    
    uint256 ausschreibungsEnde;
    uint256 angebotsZaehler;
    string produkt = "";
    //Ersteller des Smart Contracts (Anfrageersteller der Ausschreibung)
    address payable owner;
    
    struct angebot {
        address bieter;
        string angebotsHash;
        uint256 zeitstempel;
    }

    // Man benötigt bei Solidity einen Zaehler, da man bei Mappings nicht iterieren kann
    mapping (address => uint) public indexBieter;
    mapping (uint => angebot) public eingereichteAngebote;

    event angebot_event(uint256 angebotsNummer, address lieferant);

    constructor (string memory _produkt, uint _ausschreibungsEnde, address _owner) public {
        produkt = _produkt;
        owner = payable(msg.sender);
        ausschreibungsEnde = _ausschreibungsEnde;
        angebotsZaehler = 0;
    }
    
    function angebotEinreichen(string memory angebotsHash) public {
        require(block.timestamp < ausschreibungsEnde);
        // Überprüfung, dass die selbe Adresse nicht mehr als ein Angbot einreicht
        require(indexBieter[msg.sender] == 0);
        angebotsZaehler++;
        indexBieter[msg.sender] = angebotsZaehler;
        eingereichteAngebote[angebotsZaehler] = angebot(msg.sender, angebotsHash, block.timestamp);
        emit angebot_event(angebotsZaehler, msg.sender);
    }
    // Kontraktdestruktor
    function destroy() public payable{
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}

contract AusschreibungsErstellung {
    // Speicherung der Kontraktadressen der Ausschreibungen, um später diese zu lesen
    ausschreibung [] public ausschreibungen;

    function erstellungAusschreibung(string memory produktName, uint256 ausschreibungsDauer) public{
        // address(this) ist die Adresse des neuen Ausschreibung Kontrakts
        ausschreibung neueAusschreibung = new ausschreibung(produktName, ausschreibungsDauer, address(this));
        ausschreibungen.push(neueAusschreibung);
    }

    function getVal(uint256 zahl) public view returns (ausschreibung) {
        return ausschreibungen[zahl];
    }
    
}