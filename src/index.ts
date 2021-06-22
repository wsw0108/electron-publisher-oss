import { HttpPublisher, PublishContext, PublishOptions, UploadTask } from 'electron-publish';
import { ClientRequest } from 'http';
import { Arch } from 'builder-util';

export interface OSSOptions extends PublishOptions {
    readonly provider: "oss"
    readonly credentials: string
    readonly bucket: string
    readonly base: string
    readonly endpoints?: string | null
}

export default class OSSPublisher extends HttpPublisher {
    readonly providerName = "OSS";

    constructor(context: PublishContext, private options: OSSOptions) {
        super(context);
    }

    async upload(task: UploadTask): Promise<any> {
        return super.upload(task);
    }

    protected async doUpload(fileName: string, arch: Arch, dataLength: number, requestProcessor: (request: ClientRequest, reject: (error: Error) => void) => void) {
        console.log(fileName);
        console.log(arch);
        console.log(dataLength);
    }

    protected getBucketName(): string {
        return this.options.bucket;
    }

    toString() {
        return `${this.providerName} (bucket: ${this.getBucketName()})`;
    }
}
