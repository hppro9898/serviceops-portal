/* The fleet, as data.
 *
 * It used to live in EndpointsListPage, which imports the drawer stack — so every data module that
 * needed the fleet (bomData, aiModelsData, the dashboards) pulled the entire drawer graph in with
 * it. That was a latent import cycle, and it closed the day DrawerStack imported a drawer that
 * reads AI data: the cycle resolved to `undefined` at module-init and the asset drawer rendered
 * with no tabs at all. This module imports nothing, so it cannot participate in a cycle.
 */

export interface Endpoint {
  id: string;
  /** Agent reachable right now — drives the small green/amber dot before the id pill. */
  agentOnline: boolean;
  hostName: string;
  ipAddress: string;
  osName: string;
  /** OS build, or null = --- (agent has not reported an inventory yet) */
  version: string | null;
  servicePack: string | null;
  architecture: '64 BIT' | '32 BIT';
  remoteOffice: string | null;
  systemHealth: 'Healthy' | 'Warning' | 'Critical' | null;
  tags: string[];
  rebootRequired: 'Yes' | 'No';
}

// Realistic corporate fleet (mirrors the Patch Endpoint tab's naming/offices — no test data).
export const mockEndpoints: Endpoint[] = [
  { id: 'EP-408', agentOnline: true, hostName: 'FIN-LT-0188', ipAddress: '10.20.22.188', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.8328', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Mumbai Office', systemHealth: 'Healthy', tags: ['finance'], rebootRequired: 'No' },
  { id: 'EP-406', agentOnline: true, hostName: 'SAL-LT-0204', ipAddress: '10.20.23.204', osName: 'Microsoft Windows 10 Enterprise', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Bengaluru Campus', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-400', agentOnline: true, hostName: 'ENG-LT-0312', ipAddress: '10.20.19.112', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.8655', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Hyderabad Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'Yes' },
  { id: 'EP-397', agentOnline: true, hostName: 'Jevyjava-LT', ipAddress: '192.168.112.75', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.8655', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-396', agentOnline: false, hostName: 'DESKTOP-A19KJ', ipAddress: '10.20.41.40', osName: 'Microsoft Windows 10 Pro', version: null, servicePack: null, architecture: '64 BIT', remoteOffice: 'Mumbai Office', systemHealth: null, tags: [], rebootRequired: 'No' },
  { id: 'EP-392', agentOnline: true, hostName: 'DHRUVPANCHAL', ipAddress: '10.20.40.202', osName: 'Microsoft Windows 11 Enterprise', version: '10.0.26200.7462', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-391', agentOnline: true, hostName: 'Adarsh-PC', ipAddress: '192.168.1.11', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Bengaluru Campus', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-389', agentOnline: false, hostName: 'DESKTOP-N81KQ', ipAddress: '10.20.41.103', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.6691', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Delhi NCR Office', systemHealth: 'Warning', tags: [], rebootRequired: 'Yes' },
  { id: 'EP-388', agentOnline: true, hostName: 'PARTH-UPADHYAY', ipAddress: '10.20.40.182', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.8037', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-386', agentOnline: true, hostName: 'DESKTOP-DK09P', ipAddress: '192.168.0.104', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Bengaluru Campus', systemHealth: 'Healthy', tags: ['vip'], rebootRequired: 'No' },
  { id: 'EP-384', agentOnline: true, hostName: 'ARJUN-CHAUHAN', ipAddress: '192.168.1.14', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Pune Development Center', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-383', agentOnline: false, hostName: 'DESKTOP-5F2AL', ipAddress: '192.168.29.101', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Delhi NCR Office', systemHealth: null, tags: [], rebootRequired: 'No' },
  { id: 'EP-382', agentOnline: true, hostName: 'ACI10068-LP', ipAddress: '20.0.20.32', osName: 'Microsoft Windows 10 Enterprise', version: '10.0.19045.6216', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-381', agentOnline: true, hostName: 'ACI10053-LP', ipAddress: '20.0.20.77', osName: 'Microsoft Windows 10 Enterprise', version: '10.0.19045.6396', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Warning', tags: [], rebootRequired: 'Yes' },
  { id: 'EP-380', agentOnline: true, hostName: 'ACIWSUSV-01', ipAddress: '192.168.1.13', osName: 'Microsoft Windows Server 2022 Standard', version: '10.0.20348.2762', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: ['server', 'wsus'], rebootRequired: 'No' },
  { id: 'EP-378', agentOnline: false, hostName: 'DESKTOP-BFUU5TA', ipAddress: '10.20.40.85', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6456', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Muscat Office', systemHealth: null, tags: [], rebootRequired: 'No' },
  { id: 'EP-374', agentOnline: true, hostName: 'Dharati-Bhimani', ipAddress: '10.20.40.205', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6456', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Muscat Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-372', agentOnline: true, hostName: 'Suryatop-Sasmal', ipAddress: '172.20.10.2', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Dubai Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-368', agentOnline: true, hostName: 'DESKTOP-A3RMK1H', ipAddress: '10.20.40.67', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6466', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Dubai Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-367', agentOnline: true, hostName: 'Krutarth-Desktop', ipAddress: '10.20.41.23', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.6899', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Muscat Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-361', agentOnline: true, hostName: 'HR-DT-0142', ipAddress: '10.20.21.142', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.6216', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-357', agentOnline: false, hostName: 'REC-DT-0023', ipAddress: '10.20.21.23', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.5011', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Muscat Office', systemHealth: 'Critical', tags: ['kiosk'], rebootRequired: 'Yes' },
  { id: 'EP-352', agentOnline: true, hostName: 'DC1-APP-01', ipAddress: '10.20.40.21', osName: 'Microsoft Windows Server 2019 Datacenter', version: '10.0.17763.6893', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: ['server'], rebootRequired: 'No' },
  { id: 'EP-351', agentOnline: true, hostName: 'DC1-DB-01', ipAddress: '10.20.40.33', osName: 'Microsoft Windows Server 2022 Datacenter', version: '10.0.20348.2762', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Ahmedabad HQ', systemHealth: 'Healthy', tags: ['server', 'database'], rebootRequired: 'No' },
  { id: 'EP-349', agentOnline: true, hostName: 'DESKTOP-1KQZ9', ipAddress: '10.59.98.96', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.6101', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Muscat Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-346', agentOnline: true, hostName: 'SUP-LT-0108', ipAddress: '10.20.24.108', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.6300', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Mumbai Office', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-341', agentOnline: false, hostName: 'OFC-PRT-0207', ipAddress: '10.20.30.207', osName: 'Microsoft Windows 10 Pro', version: '10.0.19045.5011', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Dubai Office', systemHealth: 'Warning', tags: ['kiosk'], rebootRequired: 'No' },
  { id: 'EP-338', agentOnline: true, hostName: 'MKT-LT-0221', ipAddress: '10.20.25.221', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.8328', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Bengaluru Campus', systemHealth: 'Healthy', tags: [], rebootRequired: 'No' },
  { id: 'EP-334', agentOnline: true, hostName: 'ENG-LT-0284', ipAddress: '10.20.19.84', osName: 'Microsoft Windows 11 Pro', version: '10.0.26200.8037', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Pune Development Center', systemHealth: 'Healthy', tags: [], rebootRequired: 'Yes' },
  { id: 'EP-329', agentOnline: true, hostName: 'FIN-DT-0067', ipAddress: '10.20.22.67', osName: 'Microsoft Windows 10 Enterprise', version: '10.0.19045.6396', servicePack: 'None', architecture: '64 BIT', remoteOffice: 'Mumbai Office', systemHealth: 'Healthy', tags: ['finance'], rebootRequired: 'No' },
];
