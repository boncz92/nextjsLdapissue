import ldapjs from 'ldapjs';

export async function POST(request) {

    async function bindAndSearchLdap(searchBase, filter, attributes) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = ldapjs.createClient({ url: 'ldap://ldap.forumsys.com:389' });
                await new Promise((resolveClientBind, rejectClientBind) => {
                    client.bind('cn=read-only-admin,dc=example,dc=com', 'password', (err, res) => {
                        if (err) {
                            rejectClientBind(err);
                            return;
                        }
                        console.log('LDAP bind successful');
                        resolveClientBind(client);
                    });
                });

                const entries = await new Promise((resolveSearch, rejectSearch) => {
                    client.search(searchBase, { scope: 'sub', filter, attributes }, (err, res) => {
                        if (err) {
                            rejectSearch(err);
                            return;
                        }

                        const entries = [];
                        res.on('searchEntry', (entry) => {
                            entries.push(entry.pojo);
                        });
                        res.on('end', () => {
                            resolveSearch(entries);
                        });
                        res.on('error', (err) => {
                            rejectSearch(err);
                        });
                    });
                });

                resolve(entries);
            } catch (err) {
                reject(err);
            } finally {
                // Consider adding logic to close the LDAP connection here
            }
        });
    }

    let results = await bindAndSearchLdap(' dc=example,dc=com', '(uid=boyle)', ['uid'])


    return Response.json({ message: results }, { status: 200 })
}