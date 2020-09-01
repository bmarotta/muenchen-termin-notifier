const rp = require('request-promise-native');
const nodemailer = require('nodemailer');

// For mor info check https://nodemailer.com/about/
const my_mail = 'mail@mail.com';
const smtp_config = {
        host: "smpt.server.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: my_mail,
          pass: 'my-password'
        }
      };

// Look for the right URL
// This one if for Führerschein
// const URL = 'https://terminvereinbarung.muenchen.de/fs/termin/index.php?loc=FS&ct=1071899';
// const FORM = {
		// // Adjust for your use case
        // 'step': 'WEB_APPOINT_SEARCH_BY_CASETYPES',
        // 'CASETYPES[FS Abnutzung, Namensänderung]': '0',
        // 'CASETYPES[FS Ersatzführerschein]': '0',
        // 'CASETYPES[FS Internationaler FS beantragen]': '0',
        // 'CASETYPES[FS Internationaler FS bei Besitz]': '0',
        // 'CASETYPES[FS Umschreibung Ausländischer FS]': '1',
        // 'CASETYPES[FS PBS für Taxi etc beantragen]': '0',
        // 'CASETYPES[FS Ersatz PBS]': '0',
        // 'CASETYPES[FS Dienstführerschein umschreiben]': '0',
        // 'CASETYPES[FS Internationaler FS bei Besitz]': '0',
        // 'CASETYPES[FS Abholung Führerschein]': '0',
        // 'CASETYPES[FS Abholung eines Personenbeförderungsscheines]': '0',
        // 'CASETYPES[FS Anmeldung und Vereinbarung Prüftermin]': '0',
        // 'CASETYPES[FS Allgemeine Information zur Ortskundeprüfung]': '0',
        // 'CASETYPES[FS Besprechung des Prüfungsergebnisses]': '0',
    // };
	
// This one if for Anmeldung
const URL = 'https://terminvereinbarung.muenchen.de/bba/termin/index.php?loc=BB';
const FORM = {
	'step': 'WEB_APPOINT_SEARCH_BY_CASETYPES',
	'CASETYPES[An- oder Ummeldung - Einzelperson]': '1',
	'CASETYPES[An- oder Ummeldung - Einzelperson mit eigenen Fahrzeugen]': '0',
	'CASETYPES[An- oder Ummeldung - Familie]': '0',
	'CASETYPES[An- oder Ummeldung - Familie mit eigenen Fahrzeugen]': '0',
	'CASETYPES[Haushaltsbescheinigung]': '0',
	'CASETYPES[Familienstandsänderung/ Namensänderung]': '0',
	'CASETYPES[Antrag Personalausweis]': '0',
	'CASETYPES[Antrag Reisepass/Expressreisepass]': '0',
	'CASETYPES[Antrag vorläufiger Reisepass]': '0',
	'CASETYPES[Antrag oder Verlängerung/Aktualisierung Kinderreisepass]': '0',
	'CASETYPES[Ausweisdokumente - Familie (Minderjährige und deren gesetzliche Vertreter)]': '0',
	'CASETYPES[Nachträgliche Anschriftenänderung Personalausweis/Reisepass/eAT]': '0',
	'CASETYPES[Nachträgliches Einschalten eID / Nachträgliche %C3%84nderung PIN]': '0',
	'CASETYPES[Widerruf der Verlust- oder Diebstahlanzeige von Personalausweis oder Reisepass]': '0',
	'CASETYPES[Verlust- oder Diebstahlanzeige von Personalausweis]': '0',
	'CASETYPES[Verlust- oder Diebstahlanzeige von Reisepass]': '0',
	'CASETYPES[Personalausweis oder Reisepass abholen]': '0',
	'CASETYPES[Bis zu 5 Beglaubigungen Unterschrift]': '0',
	'CASETYPES[Bis zu 5 Beglaubigungen Dokument]': '0',
	'CASETYPES[Bis zu 20 Beglaubigungen]': '0',
	'CASETYPES[Fahrzeug wieder anmelden]': '0',
	'CASETYPES[Fahrzeug au%C3%9Fer Betrieb setzen]': '0',
	'CASETYPES[Adressänderung in Fahrzeugpapiere eintragen lassen]': '0',
	'CASETYPES[Namensänderung in Fahrzeugpapiere eintragen lassen]': '0'
};


var options = {
    method: 'POST',
    uri: URL, // Adjust it for your use case
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0', // Not sure if it should be changed
        'Accept': 'text/html,application/xhtml xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://terminvereinbarung.muenchen.de',
        'Cookie': '_et_coid=2ad0d038172806efa09fbbe8cfbcb9c2; PHPSESSID=3trkh8fe8vefmdd85hjnk50207', // Not sure if this is permanent
    },
    form: FORM
};

// rp.debug = true;

function parseHtml(html) {
    if (html) {
        var i = html.indexOf('jsonAppoints');
        if (i > -1) {
            i = html.indexOf('\'', i) + 1;
            var j = html.indexOf('\'', i);
            var jsonAppoints = html.substr(i, j - i);
            console.log('jsonAppoints: ', jsonAppoints);
            parseAppoints(jsonAppoints);
            
        } else {
            console.error('Wrong page expected');
        }
        
    }
}

function parseAppoints(jsonAppoints) {
    var found = "";
    var appoints = JSON.parse(jsonAppoints);
    var keys = Object.getOwnPropertyNames(appoints);
    for (var key of keys) {
        var schalter = appoints[key];
        console.log(`Parsing ${key} => ${schalter.caption}`);
        var dates = Object.getOwnPropertyNames(schalter.appoints);
		var addressAdded = false;
        for (var date of dates) {
            var times = schalter.appoints[date];
            if (times && times.length) {
                var s = `Appointment found for ${schalter.caption} at ${date}: ${times.join(" / ")}`;
                console.warn(s);
				if (!addressAdded) {
					addressAdded = true;
					found += '\n**' + schalter.caption + '**';
				}
                found += '\n' + s;
            } else {
                console.log(`No appointment found for ${date}`);
            }
        }
    }
    
    if (found) {
        console.log('Sending e-mail...');
        sendEmail(found);        
    } else {
        console.log('No appointment this time');
    }
    
}

function sendEmail(appointments) {
    var transporter = nodemailer.createTransport(smtp_config);
      
      var mailOptions = {
        from: my_mail,
        to: my_mail,
        subject: 'Appointment found',
        text: 'Please check at ' + URL + '\n\n' + appointments
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 
}

//parseAppoints('{"Termin FS Allgemeinschalter_G":{"caption":"F\u00fchrerscheinstelle Garmischer Str. 19\/21","appoints":{"2020-08-30":[],"2020-08-31":[],"2020-09-01":["10:00","11:00"],"2020-09-02":[],"2020-09-03":[],"2020-09-04":[],"2020-09-05":[],"2020-09-06":[],"2020-09-07":[],"2020-09-08":[],"2020-09-09":[],"2020-09-10":[],"2020-09-11":[],"2020-09-12":[],"2020-09-13":[],"2020-09-14":[]},"id":"a6a84abc3c8666ca80a3655eef15bade"}}');

rp(options).then(parseHtml).catch((reason) => { console.error('Failed: ' + reason); });