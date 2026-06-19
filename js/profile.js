// Резервный профиль Nightscout
// Используется только если API не вернул активный профиль

const profile = {
    basal: [],
    isf: [],
    cr: [],
    dia: 5,
    units: "mmol",
    timezone: "Europe/Moscow"
};

export default profile;
