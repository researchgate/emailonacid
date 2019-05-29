export type ClientId = string;
export type TestId = string;

export interface Client {
  /**
   * Validates credentials
   */
  auth(): Promise<boolean>;
  /**
   * This call returns a list of available email clients. If you are on a client-restricted plan, this will only show the clients that you are eligible to select. The object will be structured as shown here.
   * The object will contain a “clients” property, with properties corresponding to the client IDs. Each of these properties will contain an object containing the client ID, a printable client name, and OS. Clients are split into three “classes”: “Web”, “Application”, and “Mobile”. “Browser” type clients will contain a “browser” property.
   * The “rotate” and “image_blocking” describe client features. The “default” property shows whether or not this client will be processed when submitting a test without setting the clients.
   * Missing properties should be interpreted as a feature NOT being supported (i.e. equivalent to “false”). The API MAY respond with “false”.
   * @see https://api.emailonacid.com/docs/latest/email-clients#get-clients
   */
  getClients(): Promise<
    Array<{
      id: ClientId;
      client: string;
      os: string;
      category: 'Application' | 'Mobile' | 'Web';
      rotate: boolean;
      imageBlocking: boolean;
      default: boolean;
    }>
  >;
  /**
   * This call returns a list of client IDs currently configured to be processed by default.
   * The object will contain a single property of “clients”, which will be an array of client IDs returned from the available client list.
   * @see https://api.emailonacid.com/docs/latest/email-clients#get-default-clients
   */
  getDefaultClients(): Promise<Array<ClientId>>;
  /**
   * This call updates your configured default clients and returns the updated list of default clients.
   * The request must contain a property of “clients” that contains an array of client IDs as returned from the available client list.
   * The response will contain a property of “clients” that contains the array of client IDs as returned from the available client list. If your request contained invalid client IDs, the system will remove them from the list and report them in a separate “warnings” property. If you send no valid clients, your default client list will not change and an error will be reported. If you send an empty array, your default list will be cleared and ALL clients will be processed when you submit a test.
   * @see https://api.emailonacid.com/docs/latest/email-clients#set-default-clients
   */
  setDefaultClients(clientIds: Array<ClientId>): Promise<Array<ClientId>>;
  /**
   * This call provides an array of “tips” to troubleshoot issues in specific clients. The <client_id> URL parameter is a client ID returned from the Client List functions.
   * The response object will have a property “client” with the name of the client this tip applies to, and a property of “tips” that contains an array of objects with properties “name” and “tip” that contain strings. The name is not formatted for presentation, and is simply to give an idea of the contents of the tip.
   * This array may be empty for some clients.
   * @see https://api.emailonacid.com/docs/latest/email-clients#get-client-tips
   */
  getClientTips(clientId: ClientId): Promise<Array<string>>;
  /**
   * Creates new single test and submits it to Email-On-Acid system for processing.
   * Resolves resolved data containes unique generated id.
   * @see https://api.emailonacid.com/docs/latest/email-testing#create-test
   */
  createTest(testOptions: {
    subject: string;
    /** The email source of your email, encoded as declared in transferEncoding. Required if no url. */
    html?: string;
    /** A url pointing to the email source of your email. Required if no html. */
    url?: string;
    /** subject and html should be encoded as described by this field. */
    transferEncoding?: 'base64' | 'quoted-printable' | '7bit' | '8bit';
    /** The character set your HTML is encoded in. subject and html should be encoded as described by this field. */
    charset?: string;
    /** If true, run as a free test with limited features. */
    freeTest?: boolean;
    /** If true, run without creating any actual content. */
    sandbox?: boolean;
    /** Enterprise customers can set this value for searching and internal reporting. */
    referenceId?: string;
    /** Enterprise customers can set this value for searching and internal reporting. */
    customerId?: string;
    /** Non-Enterprise customers can set this value for searching and tagging. */
    tags?: Array<string>;
    /** An array of string IDs as returned from {@link https://api.emailonacid.com/docs/latest/email-clients client list functions}. */
    clients?: Array<ClientId>;
    /** If true, run a test with images blocked in clients that support it. */
    imageBlocking?: boolean;
    /** If set, a {@link https://api.emailonacid.com/docs/latest/spam-testing#create-test Spam Test} will be run with the Email Test. */
    spam?: Object;
  }): Promise<{
    id: TestId;
    referenceId: string;
    customerId: string;
    spam?: {
      addressList?: Array<string>;
      testMethod: 'eoa' | 'smtp' | 'seed';
      smtpInfo?: {
        host: string;
        port: number;
        secure: 'ssl' | 'tsl' | '';
        username: string;
        password: string;
      };
      fromAddress: string;
      key: string;
    };
  }>;
  /**
   * Resolves a list of all available Email Tests and some metadata about them.
   * Email Tests are stored for 90 days.
   * @see https://api.emailonacid.com/docs/latest/email-testing#get-tests
   */
  getTests(): Promise<
    Array<{
      id: TestId;
      date: Date;
      type: 'email-test' | 'spam-test';
      subject: string;
      headers: { [key: string]: string };
    }>
  >;
  /**
   * Resolves the subject and submission time in UNIX timestamp format.
   * It will also contain one to four properties containing an array of clients.
   * The "completed" property shows clients that have completed screenshots uploaded.
   * The "processing" property contains clients which are still being processed by our system.
   * The "bounced" property contains clients that were bounced by the destination and
   * cannot be retried.
   * @see https://api.emailonacid.com/docs/latest/email-testing#get-test
   */
  getTest(
    testId: TestId
  ): Promise<{
    subject: string;
    date: Date;
    completed: Array<ClientId>;
    processing: Array<ClientId>;
    bounced: Array<ClientId>;
  }>;
  /**
   * Returns detailed results for screenshots including their upload locations,
   * send times, completion times, and information about bounces, if any.
   * @see https://api.emailonacid.com/docs/latest/email-testing#get-results
   */
  getResults(
    testId: TestId
  ): Promise<
    Array<{
      id: ClientId;
      displayName: string;
      client: string;
      os: string;
      category: 'Application' | 'Mobile' | 'Web';
      screenshots: { [key: string]: string };
      thumbnail: string;
      status: 'Processing' | 'Complete' | 'Bounced' | 'Pending';
      statusDetails: {
        submitted: Date;
        completed: Date;
        attempts: number;
      };
    }>
  >;
  /**
   * Resolves an email body content.
   * @see https://api.emailonacid.com/docs/latest/email-testing#get-test-content
   */
  getTestContent(testId: TestId): Promise<string>;
  /**
   * Marks an Email Test as deleted.
   * Once it is deleted, it cannot be recovered.
   * @see https://api.emailonacid.com/docs/latest/email-testing#delete-test
   */
  deleteTest(testId: TestId): Promise<boolean>;
}

/** Creates new EmailOnAcid API client */
declare function createClient(clientOptions: {
  apiKey: string;
  accountPassword: string;
  baseApiUrl?: string;
  defaultClients?: Array<ClientId>;
}): Client;

export default createClient;
