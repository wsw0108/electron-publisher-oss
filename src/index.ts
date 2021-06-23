import fs from 'fs';
import path from 'path';
import { Publisher, PublishContext, PublishOptions, UploadTask } from 'electron-publish';
import untildify from 'untildify';
import { default as OSS } from 'ali-oss';
import YAML from 'yaml';

export interface OSSOptions extends PublishOptions {
    readonly provider: "oss"
    readonly credentials?: string
    readonly bucket: string
    readonly base: string
    readonly region?: string
    readonly endpoint?: string
    readonly secure: boolean
}

interface Credentials {
    readonly accessKeyId: string
    readonly accessKeySecret: string
    readonly region?: string
    readonly endpoint?: string
}

export default class OSSPublisher extends Publisher {
    public readonly providerName = "OSS";
    protected client: OSS;

    constructor(context: PublishContext, private options: OSSOptions) {
        super(context);
        const credentialsFile: string = untildify(this.options.credentials || "~/.fcli/config.yaml");
        const credentials = this.parseCredentials(credentialsFile);
        const clientOpts: OSS.Options = {
            accessKeyId: credentials.accessKeyId,
            accessKeySecret: credentials.accessKeySecret,
            bucket: this.options.bucket,
            region: this.options.region || credentials.region,
            endpoint: this.options.endpoint || credentials.endpoint,
            secure: this.options.secure
        }
        this.client = new OSS(clientOpts);
    }

    parseCredentials(file: string): Credentials {
        const content = fs.readFileSync(file, 'utf8');
        const doc = YAML.parse(content);
        return {
            accessKeyId: doc.access_key_id,
            accessKeySecret: doc.access_key_secret
        };
    }

    async upload(task: UploadTask): Promise<any> {
        // TODO: safeArtifactName?
        const fileName = path.basename(task.file);
        const name = this.options.base + "/" + fileName;
        // TODO: use progress bar from Publisher
        const stream = fs.createReadStream(task.file);
        return await this.client.putStream(name, stream);
    }

    toString() {
        return `${this.providerName} (bucket: ${this.options.bucket})`;
    }
}
