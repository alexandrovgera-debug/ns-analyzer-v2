export default class NightscoutAPI {

    constructor(baseUrl) {

        this.baseUrl = baseUrl.replace(/\/$/, "");

    }

    async fetchJson(url, error) {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(error);
        }

        return await response.json();

    }

    async getProfile() {

        const profiles = await this.fetchJson(
            `${this.baseUrl}/api/v1/profile.json`,
            "Не удалось получить профиль Nightscout"
        );

        if (!profiles.length) {
            throw new Error("Профиль отсутствует");
        }

        const root = profiles[0];

        const activeName = root.defaultProfile;

        const active = root.store?.[activeName];

        if (!active) {
            throw new Error("Активный профиль не найден");
        }

        return {

            basal: active.basal || [],

            isf: active.sens || [],

            cr: active.carbratio || [],

            dia: active.dia,

            timezone: active.timezone,

            units: active.units

        };

    }

    buildQuery(start, end) {

        return (
            `find[created_at][$gte]=${encodeURIComponent(start.toISOString())}` +
            `&find[created_at][$lte]=${encodeURIComponent(end.toISOString())}` +
            `&count=5000`
        );

    }

    async getDeviceStatus(start, end) {

        return await this.fetchJson(

            `${this.baseUrl}/api/v1/devicestatus.json?${this.buildQuery(start, end)}`,

            "Не удалось получить DeviceStatus"

        );

    }

    async getEntries(start, end) {

        return await this.fetchJson(

            `${this.baseUrl}/api/v1/entries.json?${this.buildQuery(start, end)}`,

            "Не удалось получить Entries"

        );

    }

    async getTreatments(start, end) {

        return await this.fetchJson(

            `${this.baseUrl}/api/v1/treatments.json?${this.buildQuery(start, end)}`,

            "Не удалось получить Treatments"

        );

    }

    async loadDay(date) {

        const start = new Date(date);

        start.setHours(0, 0, 0, 0);

        const today = new Date();

        const end = new Date(date);

        if (
            today.getFullYear() === date.getFullYear() &&
            today.getMonth() === date.getMonth() &&
            today.getDate() === date.getDate()
        ) {

            end.setTime(today.getTime());

        } else {

            end.setHours(23, 59, 59, 999);

        }

        const [

            profile,

            deviceStatus,

            entries,

            treatments

        ] = await Promise.all([

            this.getProfile(),

            this.getDeviceStatus(start, end),

            this.getEntries(start, end),

            this.getTreatments(start, end)

        ]);

        return {

            profile,

            deviceStatus,

            entries,

            treatments,

            start,

            end

        };

    }

    getLast7Days() {

        const days = [];

        const today = new Date();

        for (let i = 6; i >= 0; i--) {

            const d = new Date(today);

            d.setDate(today.getDate() - i);

            days.push(d);

        }

        return days;

    }

}
