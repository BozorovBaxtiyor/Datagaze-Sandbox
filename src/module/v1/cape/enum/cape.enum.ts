export enum TaskCategory {
    All = 'all',
    File = 'file',
    URL = 'url',
}

export enum IncidentType {
    All = 'all',
    Malware = 'malware',
    Ransomware = 'ransomware',
    Trojan = 'trojan',
    Virus = 'virus',
    Worm = 'worm',
    Spyware = 'spyware',
    Cryptominer = 'cryptominer',
    Unknown = 'unknown',
}

export enum TaskStatus {
    All = 'all',
    Pending = 'pending',
    Running = 'running',
    Processing = 'processing',
    Analyzing = 'analyzing',
    Reported = 'reported',
    Failed = 'failed',
    Completed ='completed',
}