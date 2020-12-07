export const RolesMixin = { 
    data() {
        return {
            localizedRoles: []
        }
    },
    created() {
        this.localizedRoles = [{
                name: 'user',
                title: this.$t('user')
            }, {
                name: 'manager',
                title: this.$t('manager')
            }, {
                name: 'coordinator',
                title: this.$t('coordinator')
            }, {
                name: 'editor',
                title: this.$t('editor')
            }, {
                name: 'reviewer',
                title: this.$t('reviewer')
            },
        ]
    }
}