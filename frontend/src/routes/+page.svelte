<script lang="ts">
    import Sidebar from '$lib/components/Sidebar.svelte';
    import DashboardContainer from '$lib/components/DashboardContainer.svelte';

    // TODO: move to an asset folder so it is directly accessable, if possible
    function downloadShareXConfig() {
        const token = localStorage.getItem('token');
        const origin = window.location.origin;

        const config = {
            Version: '15.0.0',
            Name: 'MyShare',
            DestinationType: 'ImageUploader, TextUploader, FileUploader',
            RequestMethod: 'POST',
            RequestURL: `${origin}/api/upload`,
            Headers: {
                Authorization: token,
            },
            Body: 'MultipartFormData',
            FileFormName: 'file',
            URL: `${origin}/uploads/{json:filename}`,
            ErrorMessage: '{json:error}',
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'myshare.sxcu';
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<Sidebar>
    <div class="flex flex-col items-center justify-start w-full py-4">
        <p class="text-lg font-bold">
            This is text before the dashboard container. Feel free to add notifications here, or
            something. (ex. if we do maintenancce)
        </p>
        <button onclick={downloadShareXConfig}> Download ShareX Config </button>
        <DashboardContainer />
    </div>
</Sidebar>
