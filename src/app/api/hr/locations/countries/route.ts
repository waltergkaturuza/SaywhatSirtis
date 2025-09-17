import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// African countries with their provinces/states/regions
const AFRICAN_COUNTRIES = {
  'DZ': {
    name: 'Algeria',
    code: 'DZ',
    provinces: [
      'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
      'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
      'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
      'Constantine', 'Médéa', 'Mostaganem', 'MSila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
      'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 
      'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 
      'Aïn Témouchent', 'Ghardaïa', 'Relizane'
    ]
  },
  'AO': {
    name: 'Angola',
    code: 'AO',
    provinces: [
      'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul',
      'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 
      'Moxico', 'Namibe', 'Uíge', 'Zaire'
    ]
  },
  'BJ': {
    name: 'Benin',
    code: 'BJ',
    provinces: [
      'Alibori', 'Atakora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 
      'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'
    ]
  },
  'BW': {
    name: 'Botswana',
    code: 'BW',
    provinces: [
      'Central', 'Ghanzi', 'Kgalagadi', 'Kgatleng', 'Kweneng', 'North East', 'North West', 
      'South East', 'Southern'
    ]
  },
  'BF': {
    name: 'Burkina Faso',
    code: 'BF',
    provinces: [
      'Bam', 'Banwa', 'Bazèga', 'Bougouriba', 'Boulgou', 'Boulkiemdé', 'Comoé', 'Ganzourgou',
      'Gnagna', 'Gourma', 'Houet', 'Ioba', 'Kadiogo', 'Kénédougou', 'Komondjari', 'Kompienga',
      'Kossi', 'Koulpélogo', 'Kouritenga', 'Kourwéogo', 'Léraba', 'Loroum', 'Mouhoun',
      'Namentenga', 'Nahouri', 'Nayala', 'Noumbiel', 'Oubritenga', 'Oudalan', 'Passoré',
      'Poni', 'Sanguié', 'Sanmatenga', 'Séno', 'Sissili', 'Soum', 'Sourou', 'Tapoa',
      'Tuy', 'Yagha', 'Yatenga', 'Ziro', 'Zondoma', 'Zoundwéogo'
    ]
  },
  'BI': {
    name: 'Burundi',
    code: 'BI',
    provinces: [
      'Bubanza', 'Bujumbura Mairie', 'Bujumbura Rural', 'Bururi', 'Cankuzo', 'Cibitoke',
      'Gitega', 'Karuzi', 'Kayanza', 'Kirundo', 'Makamba', 'Muramvya', 'Muyinga',
      'Mwaro', 'Ngozi', 'Rumonge', 'Rutana', 'Ruyigi'
    ]
  },
  'CV': {
    name: 'Cape Verde',
    code: 'CV',
    provinces: [
      'Boa Vista', 'Brava', 'Fogo', 'Maio', 'Sal', 'Santiago', 'Santo Antão', 'São Nicolau', 'São Vicente'
    ]
  },
  'CM': {
    name: 'Cameroon',
    code: 'CM',
    provinces: [
      'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
    ]
  },
  'CF': {
    name: 'Central African Republic',
    code: 'CF',
    provinces: [
      'Bamingui-Bangoran', 'Bangui', 'Basse-Kotto', 'Haute-Kotto', 'Haut-Mbomou', 'Kémo',
      'Lobaye', 'Mambéré-Kadéï', 'Mbomou', 'Nana-Grébizi', 'Nana-Mambéré', 'Ombella-Mpoko',
      'Ouaka', 'Ouham', 'Ouham-Pendé', 'Sangha-Mbaéré', 'Vakaga'
    ]
  },
  'TD': {
    name: 'Chad',
    code: 'TD',
    provinces: [
      'Batha', 'Borkou', 'Chari-Baguirmi', 'Ennedi-Est', 'Ennedi-Ouest', 'Guéra', 'Hadjer-Lamis',
      'Kanem', 'Lac', 'Logone Occidental', 'Logone Oriental', 'Mandoul', 'Mayo-Kebbi Est',
      'Mayo-Kebbi Ouest', 'Moyen-Chari', 'Ouaddaï', 'Salamat', 'Sila', 'Tandjilé', 'Tibesti', 'Ville de NDjaména', 'Wadi Fira'
    ]
  },
  'KM': {
    name: 'Comoros',
    code: 'KM',
    provinces: ['Anjouan', 'Grande Comore', 'Mohéli']
  },
  'CG': {
    name: 'Congo',
    code: 'CG',
    provinces: [
      'Bouenza', 'Brazzaville', 'Cuvette', 'Cuvette-Ouest', 'Kouilou', 'Lékoumou',
      'Likouala', 'Niari', 'Plateaux', 'Pointe-Noire', 'Pool', 'Sangha'
    ]
  },
  'CD': {
    name: 'Democratic Republic of the Congo',
    code: 'CD',
    provinces: [
      'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kasaï',
      'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu',
      'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi',
      'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
    ]
  },
  'DJ': {
    name: 'Djibouti',
    code: 'DJ',
    provinces: ['Ali Sabieh', 'Arta', 'Dikhil', 'Djibouti', 'Obock', 'Tadjourah']
  },
  'EG': {
    name: 'Egypt',
    code: 'EG',
    provinces: [
      'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta',
      'Fayyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr el-Sheikh', 'Luxor', 'Matrouh', 'Minya',
      'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea',
      'Sharqia', 'Sohag', 'South Sinai', 'Suez'
    ]
  },
  'GQ': {
    name: 'Equatorial Guinea',
    code: 'GQ',
    provinces: ['Annobón', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 'Kié-Ntem', 'Litoral', 'Wele-Nzas']
  },
  'ER': {
    name: 'Eritrea',
    code: 'ER',
    provinces: ['Anseba', 'Debub', 'Debubawi Keyih Bahri', 'Gash-Barka', 'Maakel', 'Semenawi Keyih Bahri']
  },
  'SZ': {
    name: 'Eswatini',
    code: 'SZ',
    provinces: ['Hhohho', 'Lubombo', 'Manzini', 'Shiselweni']
  },
  'ET': {
    name: 'Ethiopia',
    code: 'ET',
    provinces: [
      'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari',
      'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
    ]
  },
  'GA': {
    name: 'Gabon',
    code: 'GA',
    provinces: [
      'Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié', 'Nyanga', 'Ogooué-Ivindo',
      'Ogooué-Lolo', 'Ogooué-Maritime', 'Woleu-Ntem'
    ]
  },
  'GM': {
    name: 'Gambia',
    code: 'GM',
    provinces: ['Banjul', 'Central River', 'Lower River', 'North Bank', 'Upper River', 'West Coast']
  },
  'GH': {
    name: 'Ghana',
    code: 'GH',
    provinces: [
      'Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'Upper East',
      'Upper West', 'Volta', 'Western'
    ]
  },
  'GN': {
    name: 'Guinea',
    code: 'GN',
    provinces: [
      'Beyla', 'Boffa', 'Boké', 'Conakry', 'Coyah', 'Dabola', 'Dalaba', 'Dinguiraye', 'Dubréka',
      'Faranah', 'Forécariah', 'Fria', 'Gaoual', 'Guékédou', 'Kankan', 'Kérouané', 'Kindia',
      'Kissidougou', 'Koubia', 'Koundara', 'Kouroussa', 'Lola', 'Macenta', 'Mali', 'Mamou',
      'Mandiana', 'Nzérékoré', 'Pita', 'Siguiri', 'Télimélé', 'Tougué', 'Yomou'
    ]
  },
  'GW': {
    name: 'Guinea-Bissau',
    code: 'GW',
    provinces: [
      'Bafatá', 'Biombo', 'Bissau', 'Bolama', 'Cacheu', 'Gabú', 'Oio', 'Quinara', 'Tombali'
    ]
  },
  'CI': {
    name: 'Ivory Coast',
    code: 'CI',
    provinces: [
      'Agnéby-Tiassa', 'Bafing', 'Bagoué', 'Béré', 'Bounkani', 'Cavally', 'Folon', 'Gbêkê',
      'Gbôklé', 'Gôh', 'Grands-Ponts', 'Guémon', 'Hambol', 'Haut-Sassandra', 'Iffou',
      'Indénié-Djuablin', 'Kabadougou', 'Lôh-Djiboua', 'Marahoué', 'Moronou', 'Nawa',
      'N\'zi', 'Poro', 'San-Pédro', 'Tchologo', 'Tonkpi', 'Worodougou', 'Yamoussoukro'
    ]
  },
  'KE': {
    name: 'Kenya',
    code: 'KE',
    provinces: [
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
      'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
      'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
      'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
      'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
      'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
    ]
  },
  'LS': {
    name: 'Lesotho',
    code: 'LS',
    provinces: [
      'Berea', 'Butha-Buthe', 'Leribe', 'Mafeteng', 'Maseru', 'Mohale\'s Hoek', 'Mokhotlong',
      'Qacha\'s Nek', 'Quthing', 'Thaba-Tseka'
    ]
  },
  'LR': {
    name: 'Liberia',
    code: 'LR',
    provinces: [
      'Bomi', 'Bong', 'Gbarpolu', 'Grand Bassa', 'Grand Cape Mount', 'Grand Gedeh', 'Grand Kru',
      'Lofa', 'Margibi', 'Maryland', 'Montserrado', 'Nimba', 'River Cess', 'River Gee', 'Sinoe'
    ]
  },
  'LY': {
    name: 'Libya',
    code: 'LY',
    provinces: [
      'Al Wahat', 'Benghazi', 'Derna', 'Ghat', 'Jabal al Akhdar', 'Jabal al Gharbi', 'Jafara',
      'Jufra', 'Kufra', 'Marj', 'Misrata', 'Murqub', 'Murzuq', 'Nalut', 'Nuqat al Khams',
      'Sabha', 'Sirte', 'Tripoli', 'Wadi al Hayaa', 'Wadi al Shatii', 'Zawiya'
    ]
  },
  'MG': {
    name: 'Madagascar',
    code: 'MG',
    provinces: [
      'Antananarivo', 'Antsiranana', 'Fianarantsoa', 'Mahajanga', 'Toamasina', 'Toliara'
    ]
  },
  'MW': {
    name: 'Malawi',
    code: 'MW',
    provinces: [
      'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza', 'Dowa', 'Karonga',
      'Kasungu', 'Likoma', 'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza',
      'Mzimba', 'Neno', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe', 'Rumphi',
      'Salima', 'Thyolo', 'Zomba'
    ]
  },
  'ML': {
    name: 'Mali',
    code: 'ML',
    provinces: [
      'Bamako', 'Gao', 'Kayes', 'Kidal', 'Koulikoro', 'Ménaka', 'Mopti', 'Ségou', 'Sikasso', 'Taoudénit'
    ]
  },
  'MR': {
    name: 'Mauritania',
    code: 'MR',
    provinces: [
      'Adrar', 'Assaba', 'Brakna', 'Dakhlet Nouadhibou', 'Gorgol', 'Guidimaka', 'Hodh Ech Chargui',
      'Hodh El Gharbi', 'Inchiri', 'Nouakchott Nord', 'Nouakchott Ouest', 'Nouakchott Sud',
      'Tagant', 'Tiris Zemmour', 'Trarza'
    ]
  },
  'MU': {
    name: 'Mauritius',
    code: 'MU',
    provinces: [
      'Black River', 'Flacq', 'Grand Port', 'Moka', 'Pamplemousses', 'Plaines Wilhems',
      'Port Louis', 'Rivière du Rempart', 'Savanne'
    ]
  },
  'MA': {
    name: 'Morocco',
    code: 'MA',
    provinces: [
      'Béni Mellal-Khénifra', 'Casablanca-Settat', 'Dakhla-Oued Ed-Dahab', 'Drâa-Tafilalet',
      'Fès-Meknès', 'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Marrakech-Safi',
      'Oriental', 'Rabat-Salé-Kénitra', 'Souss-Massa', 'Tanger-Tétouan-Al Hoceïma'
    ]
  },
  'MZ': {
    name: 'Mozambique',
    code: 'MZ',
    provinces: [
      'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 'Maputo City', 'Nampula',
      'Niassa', 'Sofala', 'Tete', 'Zambézia'
    ]
  },
  'NA': {
    name: 'Namibia',
    code: 'NA',
    provinces: [
      'Erongo', 'Hardap', 'Karas', 'Kavango East', 'Kavango West', 'Khomas', 'Kunene',
      'Ohangwena', 'Omaheke', 'Omusati', 'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'
    ]
  },
  'NE': {
    name: 'Niger',
    code: 'NE',
    provinces: [
      'Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillabéri', 'Zinder'
    ]
  },
  'NG': {
    name: 'Nigeria',
    code: 'NG',
    provinces: [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
      'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
      'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
      'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
      'Yobe', 'Zamfara'
    ]
  },
  'RW': {
    name: 'Rwanda',
    code: 'RW',
    provinces: ['Eastern', 'Kigali', 'Northern', 'Southern', 'Western']
  },
  'ST': {
    name: 'São Tomé and Príncipe',
    code: 'ST',
    provinces: ['Príncipe', 'São Tomé']
  },
  'SN': {
    name: 'Senegal',
    code: 'SN',
    provinces: [
      'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga',
      'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'
    ]
  },
  'SC': {
    name: 'Seychelles',
    code: 'SC',
    provinces: ['Inner Islands', 'Outer Islands']
  },
  'SL': {
    name: 'Sierra Leone',
    code: 'SL',
    provinces: ['Eastern', 'Northern', 'Southern', 'Western Area']
  },
  'SO': {
    name: 'Somalia',
    code: 'SO',
    provinces: [
      'Awdal', 'Bakool', 'Banaadir', 'Bari', 'Bay', 'Galguduud', 'Gedo', 'Hiiraan', 'Jubbada Dhexe',
      'Jubbada Hoose', 'Mudug', 'Nugaal', 'Sanaag', 'Shabeellaha Dhexe', 'Shabeellaha Hoose',
      'Sool', 'Togdheer', 'Woqooyi Galbeed'
    ]
  },
  'ZA': {
    name: 'South Africa',
    code: 'ZA',
    provinces: [
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga',
      'Northern Cape', 'North West', 'Western Cape'
    ]
  },
  'SS': {
    name: 'South Sudan',
    code: 'SS',
    provinces: [
      'Central Equatoria', 'Eastern Equatoria', 'Jonglei', 'Lakes', 'Northern Bahr el Ghazal',
      'Unity', 'Upper Nile', 'Warrap', 'Western Bahr el Ghazal', 'Western Equatoria'
    ]
  },
  'SD': {
    name: 'Sudan',
    code: 'SD',
    provinces: [
      'Al Jazirah', 'Blue Nile', 'Central Darfur', 'East Darfur', 'Gedaref', 'Kassala',
      'Khartoum', 'North Darfur', 'North Kordofan', 'Northern', 'Red Sea', 'River Nile',
      'Sennar', 'South Darfur', 'South Kordofan', 'West Darfur', 'West Kordofan', 'White Nile'
    ]
  },
  'TZ': {
    name: 'Tanzania',
    code: 'TZ',
    provinces: [
      'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma',
      'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza',
      'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga',
      'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South'
    ]
  },
  'TG': {
    name: 'Togo',
    code: 'TG',
    provinces: ['Centrale', 'Kara', 'Maritime', 'Plateaux', 'Savanes']
  },
  'TN': {
    name: 'Tunisia',
    code: 'TN',
    provinces: [
      'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan',
      'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir', 'Nabeul',
      'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
    ]
  },
  'UG': {
    name: 'Uganda',
    code: 'UG',
    provinces: [
      'Abim', 'Adjumani', 'Agago', 'Alebtong', 'Amolatar', 'Amudat', 'Amuria', 'Amuru',
      'Apac', 'Arua', 'Budaka', 'Bududa', 'Bugiri', 'Buhweju', 'Buikwe', 'Bukedea',
      'Bukomansimbi', 'Bukwa', 'Bulambuli', 'Buliisa', 'Bundibugyo', 'Bushenyi', 'Busia',
      'Butaleja', 'Butambala', 'Buvuma', 'Buyende', 'Dokolo', 'Gomba', 'Gulu', 'Hoima',
      'Ibanda', 'Iganga', 'Isingiro', 'Jinja', 'Kaabong', 'Kabale', 'Kabarole', 'Kaberamaido',
      'Kalangala', 'Kaliro', 'Kampala', 'Kamuli', 'Kamwenge', 'Kanungu', 'Kapchorwa', 'Kasese',
      'Katakwi', 'Kayunga', 'Kibaale', 'Kiboga', 'Kibuku', 'Kiruhura', 'Kiryandongo', 'Kisoro',
      'Kitgum', 'Koboko', 'Kole', 'Kotido', 'Kumi', 'Kween', 'Kyankwanzi', 'Kyegegwa',
      'Kyenjojo', 'Lamwo', 'Lira', 'Luuka', 'Luwero', 'Lwengo', 'Lyantonde', 'Manafwa',
      'Maracha', 'Masaka', 'Masindi', 'Mayuge', 'Mbale', 'Mbarara', 'Mitooma', 'Mityana',
      'Moroto', 'Moyo', 'Mpigi', 'Mubende', 'Mukono', 'Nakapiripirit', 'Nakaseke',
      'Nakasongola', 'Namayingo', 'Namutumba', 'Napak', 'Nebbi', 'Ngora', 'Ntoroko',
      'Ntungamo', 'Nwoya', 'Otuke', 'Oyam', 'Pader', 'Pallisa', 'Rakai', 'Rubirizi',
      'Rukungiri', 'Sembabule', 'Serere', 'Sheema', 'Sironko', 'Soroti', 'Tororo', 'Wakiso',
      'Yumbe', 'Zombo'
    ]
  },
  'ZM': {
    name: 'Zambia',
    code: 'ZM',
    provinces: [
      'Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern',
      'North-Western', 'Southern', 'Western'
    ]
  },
  'ZW': {
    name: 'Zimbabwe',
    code: 'ZW',
    provinces: [
      'Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East',
      'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'
    ]
  }
}

// GET /api/hr/locations/countries - Get all African countries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('country');

    // If country code is provided, return provinces for that country
    if (countryCode) {
      const country = AFRICAN_COUNTRIES[countryCode as keyof typeof AFRICAN_COUNTRIES];
      if (!country) {
        return NextResponse.json({ error: 'Country not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: {
          country: country.name,
          code: country.code,
          provinces: country.provinces.map((province, index) => ({
            id: `${countryCode}-${index}`,
            name: province,
            code: province.replace(/\s+/g, '_').toUpperCase()
          }))
        }
      });
    }

    // Return all countries
    const countries = Object.values(AFRICAN_COUNTRIES).map(country => ({
      code: country.code,
      name: country.name,
      provinces: country.provinces.length
    }));

    return NextResponse.json({
      success: true,
      data: countries.sort((a, b) => a.name.localeCompare(b.name))
    });

  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}