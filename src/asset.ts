export namespace Asset {
  export type Image = { kind: "image", path: string, id ?: string }
  export type Audio = { kind: "audio", path: string, id ?: string }
  export type Text  = { kind: "text",  path: string, id ?: string }
  export type Blob  = { kind: "blob",  path: string, id ?: string }
  export type Json  = { kind: "json",  path: string, id ?: string }

  export type Cache = {
    images: { [id: string]: HTMLImageElement }
    audios: { [id: string]: HTMLAudioElement }
    texts:  { [id: string]: string }
    blobs:  { [id: string]: globalThis.Blob }
    jsons:  { [id: string]: any }
  }
}

export type Asset = 
  | Asset.Image
  | Asset.Audio
  | Asset.Text
  | Asset.Blob
  | Asset.Json

export const Asset = {
  new(kind: Asset["kind"], path: string, id?: string) {
    return { kind, path, id } satisfies Asset
  },

  Image(path: string, id?: string) {
    return Asset.new("image", path, id) as Asset.Image
  },

  Audio(path: string, id?: string) {
    return Asset.new("audio", path, id) as Asset.Audio
  },

  Text(path: string, id?: string) {
    return Asset.new("text", path, id) as Asset.Text
  },

  Blob(path: string, id?: string) {
    return Asset.new("blob", path, id) as Asset.Blob
  },

  Json(path: string, id?: string) {
    return Asset.new("json", path, id) as Asset.Json
  },

  load(a: Asset) {
    switch (a.kind) {
      case "image": return Asset.loadImage(a)
      case "audio": return Asset.loadAudio(a)
      case "text":  return Asset.loadText (a)
      case "blob":  return Asset.loadBlob (a)
      case "json":  return Asset.loadJson (a)
    }
  },

  loadImage(a: Asset.Image) {
    return new Promise<HTMLImageElement>((res, rej) => {
      const image = new Image();
      image.onload  = () => res(image);
      image.onerror = () => rej(     );
      image.src     = a.path;
    })
  },

  loadAudio(a: Asset.Audio) {
    return new Promise<HTMLAudioElement>((res, rej) => {
      const audio = new Audio();
      audio.onload = () => res(audio);
      audio.onerror = () => rej(     );
      audio.src     = a.path;
    })
  },

  async loadText(a: Asset.Text) {
    return fetch(a.path).then(res => res.text())
  },

  async loadBlob(a: Asset.Blob) {
    return fetch(a.path).then(res => res.blob())
  },

  async loadJson(a: Asset.Json) {
    return fetch(a.path).then(res => res.json())
  },

  loadAll(a: Array<Asset>) {
    return Promise.all(a.map(a => Asset.load(a)));
  },

  Cache: {
    new() {
      return {
        images: {},
        audios: {},
        texts:  {},
        blobs:  {},
        jsons:  {},
      } satisfies Asset.Cache
    },

    addImage(cache: Asset.Cache, id: string, image: HTMLImageElement) {
      if (id in cache.images)
        throw new Error(`[Asset.Cache.putImage]: Image with id '${id}' already exists`);
      return cache.images[id] = image;
    },

    addAudio(cache: Asset.Cache, id: string, audio: HTMLAudioElement) {
      if (id in cache.audios)
        throw new Error(`[Asset.Cache.putAudio]: Audio with id '${id}' already exists`);
      return cache.audios[id] = audio;
    },

    addText(cache: Asset.Cache, id: string, text: string) {
      if (id in cache.texts)
        throw new Error(`[Asset.Cache.putText]: Text with id '${id}' already exists`);
      return cache.texts[id] = text;
    },

    addBlob(cache: Asset.Cache, id: string, blob: Blob) {
      if (id in cache.blobs)
        throw new Error(`[Asset.Cache.putBlob]: Blob with id '${id}' already exists`);
      return cache.blobs[id] = blob;
    },

    addJson(cache: Asset.Cache, id: string, json: any) {
      if (id in cache.jsons)
        throw new Error(`[Asset.Cache.putJson]: Json with id '${id}' already exists`);
      return cache.jsons[id] = json;
    },

    getImage(cache: Asset.Cache, id: string) {
      if (!(id in cache.images))
        throw new Error(`[Asset.Cache.getImage]: Image with id '${id}' does not exist`);
      return cache.images[id];
    },

    getAudio(cache: Asset.Cache, id: string) {
      if (!(id in cache.audios))
        throw new Error(`[Asset.Cache.getAudio]: Audio with id '${id}' does not exist`);
      return cache.audios[id];
    },

    getText(cache: Asset.Cache, id: string) {
      if (!(id in cache.texts))
        throw new Error(`[Asset.Cache.getText]: Text with id '${id}' does not exist`);
      return cache.texts[id];
    },

    getBlob(cache: Asset.Cache, id: string) {
      if (!(id in cache.blobs))
        throw new Error(`[Asset.Cache.getBlob]: Blob with id '${id}' does not exist`);
      return cache.blobs[id];
    },

    getJson(cache: Asset.Cache, id: string) {
      if (!(id in cache.jsons))
        throw new Error(`[Asset.Cache.getJson]: Json with id '${id}' does not exist`);
      return cache.jsons[id];
    },

    load(cache: Asset.Cache, a: Asset) {
      switch (a.kind) {
        case "image": return Asset.Cache.loadImage(cache, a);
        case "audio": return Asset.Cache.loadAudio(cache, a);
        case "text":  return Asset.Cache.loadText (cache, a);
        case "blob":  return Asset.Cache.loadBlob (cache, a);
        case "json":  return Asset.Cache.loadJson (cache, a);
      }
    },

    async loadImage(cache: Asset.Cache, a: Asset.Image) {
      if (!a.id) 
        throw new Error(`[Asset.Cache.loadImage]: Image asset must have an id`);
      return Asset.Cache.addImage(cache, a.id, await Asset.loadImage(a));
    },

    async loadAudio(cache: Asset.Cache, a: Asset.Audio) {
      if (!a.id) 
        throw new Error(`[Asset.Cache.loadAudio]: Audio asset must have an id`);
      return Asset.Cache.addAudio(cache, a.id, await Asset.loadAudio(a));
    },

    async loadText(cache: Asset.Cache, a: Asset.Text) {
      if (!a.id) 
        throw new Error(`[Asset.Cache.loadText]: Text asset must have an id`);
      return Asset.Cache.addText(cache, a.id, await Asset.loadText(a));
    },

    async loadBlob(cache: Asset.Cache, a: Asset.Blob) {
      if (!a.id) 
        throw new Error(`[Asset.Cache.loadBlob]: Blob asset must have an id`);
      return Asset.Cache.addBlob(cache, a.id, await Asset.loadBlob(a));
    },

    async loadJson(cache: Asset.Cache, a: Asset.Json) {
      if (!a.id) 
        throw new Error(`[Asset.Cache.loadJson]: Json asset must have an id`);
      return Asset.Cache.addJson(cache, a.id, await Asset.loadJson(a));
    },

    loadAll(cache: Asset.Cache, a: Array<Asset>) {
      return Promise.all(a.map(a => Asset.Cache.load(cache, a)));
    },
  }
}