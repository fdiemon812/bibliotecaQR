// To parse this data:
//
//   import { Convert, Welcome } from "./file";
//
//   const welcome = Convert.toWelcome(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Libro {
    key:                            string;
    type:                           string;
    seed:                           string[];
    title:                          string;
    title_suggest:                  string;
    has_fulltext:                   boolean;
    edition_count:                  number;
    edition_key:                    string[];
    publish_date:                   string[];
    publish_year:                   number[];
    first_publish_year:             number;
    number_of_pages_median:         number;
    lccn:                           string[];
    publish_place:                  string[];
    oclc:                           string[];
    contributor:                    string[];
    lcc:                            string[];
    ddc:                            string[];
    isbn:                           string[];
    last_modified_i:                number;
    ebook_count_i:                  number;
    ia:                             string[];
    public_scan_b:                  boolean;
    ia_collection_s:                string;
    lending_edition_s:              string;
    lending_identifier_s:           string;
    printdisabled_s:                string;
    cover_edition_key:              string;
    cover_i:                        number;
    first_sentence:                 string[];
    publisher:                      string[];
    language:                       string[];
    author_key:                     string[];
    author_name:                    string[];
    author_alternative_name:        string[];
    person:                         string[];
    place:                          string[];
    subject:                        string[];
    id_alibris_id:                  string[];
    id_amazon:                      string[];
    id_bodleian__oxford_university: string[];
    id_depósito_legal:              string[];
    id_goodreads:                   string[];
    id_google:                      string[];
    id_hathi_trust:                 string[];
    id_librarything:                string[];
    id_paperback_swap:              string[];
    id_wikidata:                    string[];
    ia_loaded_id:                   string[];
    ia_box_id:                      string[];
    publisher_facet:                string[];
    person_key:                     string[];
    place_key:                      string[];
    person_facet:                   string[];
    subject_facet:                  string[];
    _version_:                      number;
    place_facet:                    string[];
    lcc_sort:                       string;
    author_facet:                   string[];
    subject_key:                    string[];
    ddc_sort:                       string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toWelcome(json: string): Libro {
        return cast(JSON.parse(json), r("Welcome"));
    }

    public static welcomeToJson(value: Libro): string {
        return JSON.stringify(uncast(value, r("Welcome")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Welcome": o([
        { json: "key", js: "key", typ: "" },
        { json: "type", js: "type", typ: "" },
        { json: "seed", js: "seed", typ: a("") },
        { json: "title", js: "title", typ: "" },
        { json: "title_suggest", js: "title_suggest", typ: "" },
        { json: "has_fulltext", js: "has_fulltext", typ: true },
        { json: "edition_count", js: "edition_count", typ: 0 },
        { json: "edition_key", js: "edition_key", typ: a("") },
        { json: "publish_date", js: "publish_date", typ: a("") },
        { json: "publish_year", js: "publish_year", typ: a(0) },
        { json: "first_publish_year", js: "first_publish_year", typ: 0 },
        { json: "number_of_pages_median", js: "number_of_pages_median", typ: 0 },
        { json: "lccn", js: "lccn", typ: a("") },
        { json: "publish_place", js: "publish_place", typ: a("") },
        { json: "oclc", js: "oclc", typ: a("") },
        { json: "contributor", js: "contributor", typ: a("") },
        { json: "lcc", js: "lcc", typ: a("") },
        { json: "ddc", js: "ddc", typ: a("") },
        { json: "isbn", js: "isbn", typ: a("") },
        { json: "last_modified_i", js: "last_modified_i", typ: 0 },
        { json: "ebook_count_i", js: "ebook_count_i", typ: 0 },
        { json: "ia", js: "ia", typ: a("") },
        { json: "public_scan_b", js: "public_scan_b", typ: true },
        { json: "ia_collection_s", js: "ia_collection_s", typ: "" },
        { json: "lending_edition_s", js: "lending_edition_s", typ: "" },
        { json: "lending_identifier_s", js: "lending_identifier_s", typ: "" },
        { json: "printdisabled_s", js: "printdisabled_s", typ: "" },
        { json: "cover_edition_key", js: "cover_edition_key", typ: "" },
        { json: "cover_i", js: "cover_i", typ: 0 },
        { json: "first_sentence", js: "first_sentence", typ: a("") },
        { json: "publisher", js: "publisher", typ: a("") },
        { json: "language", js: "language", typ: a("") },
        { json: "author_key", js: "author_key", typ: a("") },
        { json: "author_name", js: "author_name", typ: a("") },
        { json: "author_alternative_name", js: "author_alternative_name", typ: a("") },
        { json: "person", js: "person", typ: a("") },
        { json: "place", js: "place", typ: a("") },
        { json: "subject", js: "subject", typ: a("") },
        { json: "id_alibris_id", js: "id_alibris_id", typ: a("") },
        { json: "id_amazon", js: "id_amazon", typ: a("") },
        { json: "id_bodleian__oxford_university", js: "id_bodleian__oxford_university", typ: a("") },
        { json: "id_depósito_legal", js: "id_depósito_legal", typ: a("") },
        { json: "id_goodreads", js: "id_goodreads", typ: a("") },
        { json: "id_google", js: "id_google", typ: a("") },
        { json: "id_hathi_trust", js: "id_hathi_trust", typ: a("") },
        { json: "id_librarything", js: "id_librarything", typ: a("") },
        { json: "id_paperback_swap", js: "id_paperback_swap", typ: a("") },
        { json: "id_wikidata", js: "id_wikidata", typ: a("") },
        { json: "ia_loaded_id", js: "ia_loaded_id", typ: a("") },
        { json: "ia_box_id", js: "ia_box_id", typ: a("") },
        { json: "publisher_facet", js: "publisher_facet", typ: a("") },
        { json: "person_key", js: "person_key", typ: a("") },
        { json: "place_key", js: "place_key", typ: a("") },
        { json: "person_facet", js: "person_facet", typ: a("") },
        { json: "subject_facet", js: "subject_facet", typ: a("") },
        { json: "_version_", js: "_version_", typ: 3.14 },
        { json: "place_facet", js: "place_facet", typ: a("") },
        { json: "lcc_sort", js: "lcc_sort", typ: "" },
        { json: "author_facet", js: "author_facet", typ: a("") },
        { json: "subject_key", js: "subject_key", typ: a("") },
        { json: "ddc_sort", js: "ddc_sort", typ: "" },
    ], false),
};
