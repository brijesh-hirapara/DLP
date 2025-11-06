import React from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = ({ showModal, setShowModal }) => {
    const { t } = useTranslation();
    return <Modal
        title={t("signIn.Privacy Policy", { defaultValue: "Privacy Policy" })}
        visible={showModal}
        width={1000}
        className="guildlines-modal"
        footer={false}
        onCancel={() => setShowModal(!showModal)}
    >
        {/* <div>
            <b>PRAVILA PRIVATNOSTI</b>
            <p>Ova Pravila privatnosti odnose se na web stranicu http://dlp.mvteo.gov.ba kojom upravlja Ministarstvo vanjske trgovine i ekonomskih odnosa BiH. S obzirom na vašu privatnost, predani smo zaštiti svih osobnih podataka koje prikupljamo i koristimo u skladu s važećim zakonima i propisima o zaštiti podataka.</p>
            <div style={{margin:'10px'}}>
            <span><b>1. Podaci koje prikupljamo</b></span>
            <p>Kada koristite našu web stranicu, možemo prikupljati sljedeće vrste podataka:</p>
            <ul style={{marginTop:'-10px'}}>
                <li>•	<b>Osobni podaci: </b> Ime, prezime, e-mail adresa, telefonski broj, adresa i drugi podaci koje nam dobrovoljno pružite putem kontakt forme.</li>
                <li>•	<b>Automatski podaci: </b> IP adresa, tip uređaja, preglednik koji koristite, stranice koje posjećujete i vrijeme provedeno na našoj stranici putem kolačića i sličnih tehnologija.</li>
            </ul>
            </div>
            <div style={{margin:'10px'}}>
            <span><b>2. Svrha prikupljanja podataka</b></span>
            <p>Prikupljamo i obrađujemo vaše osobne podatke u sljedeće svrhe:</p>
            <ul style={{marginTop:'-10px'}}>
                <li>•	Za odgovaranje na vaše upite i pružanje korisničke podrške;</li>
                <li>•	Za personalizaciju sadržaja i poboljšanje korisničkog iskustva na našoj web stranici;</li>
                <li>•	Za analizu i praćenje statističkih podataka o korištenju naše web stranice radi njezinog poboljšanja.</li>
            </ul>
            </div>
            <div style={{margin:'10px'}}>
            <span><b>3. Korištenje kolačića</b></span>
            <p>Naša stranica koristi kolačiće za poboljšanje funkcionalnosti i analizu prometa. Kolačići su male tekstualne datoteke koje se pohranjuju na vaš uređaj. Možete onemogućiti korištenje kolačića putem postavki vašeg preglednika, ali to može utjecati na funkcionalnost stranice.</p>
            </div>
            <div style={{margin:'10px'}}>
            <span><b>4. Dijeljenje podataka</b></span>
            <p>Vaši podaci neće biti dijeljeni s trećim stranama osim u sljedećim slučajevima:</p>
            <ul style={{marginTop:'-10px'}}>
                <li>•	Ako postoji zakonska obveza dijeljenja podataka s državnim tijelima;</li>
                <li>•	Ako koristimo vanjske pružatelje usluga (npr. analitičke alate), a s njima ćemo imati odgovarajuće ugovore o zaštiti podataka.</li>
            </ul>
            </div>
            <div style={{margin:'10px'}}>
            <span><b>5. Sigurnost podataka</b></span>
            <p>Primjenjujemo tehničke i organizacijske mjere kako bismo zaštitili vaše osobne podatke od neovlaštenog pristupa, gubitka, zlouporabe ili otkrivanja.</p>
            </div>
            <div style={{margin:'10px'}}>
            <span><b>6. Izmjene Pravila privatnosti</b></span>
            <p>Zadržavamo pravo izmjene ovih Pravila privatnosti. Sve izmjene bit će objavljene na ovoj stranici, a vaša daljnja uporaba stranice podrazumijeva prihvaćanje izmijenjenih uvjeta.</p>
            </div>
        </div> */}
    </Modal>
}

export default PrivacyPolicy