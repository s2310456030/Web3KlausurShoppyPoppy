export default class Tag {
    tagname;

    constructor(tagname) {
        // Speichert den Namen des Tags
        this.tagname = tagname;
    }

    // Gibt den Namen des Tags zurück
    getTagName() {
        return this.tagname;
    }
}
