import axios from "axios";
import { parseSync } from "subtitle";

const SubtitleService = {

    subtitles: null,

    getCurrent(seconds) {
        if (this.subtitles) {
            const ms = seconds * 1000;
            const line = this.subtitles.find(({ data }) =>
                ms >= data.start && ms <= data.end
            );
            return line ? line.data.text : '';
        }
        return null;
    },

    async set(url) {
        try {
            // جلب الملف كـ ArrayBuffer بدل نص مباشر
            const response = await axios.get(url, {
                responseType: "arraybuffer"
            });

            const buffer = response.data;

            // محاولة قراءة UTF-8 أولاً
            let decoder = new TextDecoder("utf-8");
            let text = decoder.decode(buffer);

            // إذا ظهر رمز الاستبدال � نحاول Windows-1256
            if (text.includes("�")) {
                decoder = new TextDecoder("windows-1256");
                text = decoder.decode(buffer);
            }

            if (!text || !text.length) return Promise.reject();

            this.subtitles = parseSync(text);
            return Promise.resolve();

        } catch (err) {
            return Promise.reject(err);
        }
    },

    setCustom(data) {
        this.subtitles = parseSync(data);
    }

};

export default SubtitleService;
