import { Document } from 'mongodb';

// Utility types
type Optional<T> = T | undefined;
type Nullable<T> = T | null;

// Signature type
interface Signature {
    name: string;
    time: number;
}

// Statistics interface
interface Statistics {
    processing: Signature[];
    signatures: Signature[];
    reporting: Signature[];
}

// File info inside target.file
interface TargetFile {
    name: string;
    path: string;
    guest_paths: string;
    type: string;
    yara: any[]; // agar yara qoidalarini ham saqlamoqchi bo'lsangiz
    cape_yara: any[];
    clamav: any[];
    virustotal: {
        error: boolean;
        msg: string;
    };
    cape_type_code: number;
    cape_type: string;
    file_ref: string;
}

// Target interface
interface Target {
    category: string;
    file: TargetFile;
}

// Info.machine
interface Machine {
    id: number;
    status: string;
    name: string;
    label: string;
    platform: string;
    manager: string;
    started_on: string;
    shutdown_on: string;
}

// Info interface
interface Info {
    version: string;
    started: string;
    ended: string;
    duration: number;
    id: number;
    category: string;
    custom: string;
    machine: Machine;
    package: string;
    timeout: boolean;
    shrike_url: Nullable<string>;
    shrike_refer: Nullable<string>;
    shrike_msg: Nullable<string>;
    shrike_sid: Nullable<number>;
    parent_id: Nullable<number>;
    tlp: Nullable<string>;
    parent_sample: any;
    options: any;
    source_url: Nullable<string>;
    route: string;
    user_id: number;
    CAPE_current_commit: string;
}

// Behavior interface
interface Behavior {
    processes: any[];
}

// Debug interface
interface Debug {
    log: string;
    errors: any[];
}

// Suricata interface
interface Suricata {
    alerts: any[];
    tls: any[];
    perf: any[];
    files: any[];
    http: any[];
    dns: any[];
    ssh: any[];
    fileinfo: any[];
    eve_log_full_path: Nullable<string>;
    alert_log_full_path: Nullable<string>;
    tls_log_full_path: Nullable<string>;
    http_log_full_path: Nullable<string>;
    file_log_full_path: Nullable<string>;
    ssh_log_full_path: Nullable<string>;
    dns_log_full_path: Nullable<string>;
}

// UrlAnalysis interface
interface UrlAnalysis {}

// Procmemory interface
type Procmemory = any[];

// Signatures interface
type Signatures = any[];

// AnalysisDocument
export interface AnalysisDocument extends Document {
    _id?: string;
    statistics: Statistics;
    target: Target;
    CAPE: {
        payloads: any[];
        configs: any[];
    };
    info: Info;
    behavior: Behavior;
    debug: Debug;
    memory: any;
    network: any;
    suricata: Suricata;
    url_analysis: UrlAnalysis;
    procmemory: Procmemory;
    signatures: Signatures;
    malscore: number;
    ttps: any[];
    malstatus: Nullable<any>;
    shots: string[];
}
