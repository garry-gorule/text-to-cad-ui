<script lang="ts">
	import { CADMIMETypes, type CADFormat, type PromptResponse, endpoints } from '$lib/endpoints'
	import { base64ToBlob } from '$lib/base64ToBlob'
	import type { ConvertResponse } from '../routes/api/convert/[output_format]/+server'
	import { toKebabCase } from '$lib/toKebabCase'
	import LoadingIndicator from './LoadingIndicator.svelte'
	import { onNavigate } from '$app/navigation'
	import { tick } from 'svelte'

	export let prompt: string = ''
	export let outputs: PromptResponse['outputs']
	export let className: string = ''
	export let code: string = ''
	let link: HTMLAnchorElement
	let currentOutput: CADFormat | 'kcl' = 'gltf'
	let outputData = outputs ? outputs[`source.${currentOutput}`] : ''
	let status: 'loading' | 'ready' | 'failed' = 'ready'

	// Create available formats list including KCL if code is provided
	$: availableFormats = [...Object.keys(CADMIMETypes), ...(code ? ['kcl'] : [])]

	onNavigate(() => {
		currentOutput = 'gltf'
	})

	$: currentMimeType =
		currentOutput === 'kcl' ? 'text/plain' : CADMIMETypes[currentOutput as CADFormat]
	$: dataUrl =
		currentOutput === 'kcl'
			? `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`
			: `data:${currentMimeType};base64,${outputData}`
	$: fileName = `${toKebabCase(prompt)}.${currentOutput}`

	async function updateOutput(e: Event) {
		const currentTarget = e.currentTarget as HTMLSelectElement
		currentOutput = currentTarget.value as CADFormat | 'kcl'
		status = 'loading'

		// Handle KCL downloads separately
		if (currentOutput === 'kcl') {
			status = code ? 'ready' : 'failed'
			if (code) {
				await tick()
				link.click()
			}
			return
		}

		if (outputs[`source.${currentOutput}`]) {
			outputData = outputs[`source.${currentOutput}`]
		} else {
			const response = await fetch(endpoints.localConvert(currentOutput), {
				method: 'POST',
				headers: { 'Content-Type': 'application/octet-stream' },
				credentials: 'include',
				body: base64ToBlob(outputs['source.gltf']) // we always have gLTF
			})

			const responseData = (await response.json()) as ConvertResponse
			if (!response.ok || !responseData || !responseData.statusCode.toString().startsWith('2')) {
				status = 'failed'
				return
			}

			outputs[`source.${currentOutput}`] = responseData.outputs[`source.${currentOutput}`]
			outputData = outputs[`source.${currentOutput}`]
		}
		status = outputData ? 'ready' : 'failed'

		if (outputData) {
			await tick()
			link.click()
		}
	}
</script>

<div class={`split-button ${status}${status === 'loading' ? ' shimmer ' : ' '}${className}`}>
	{#if status == 'ready'}
		<a href={dataUrl} download={fileName} class="mt-1" bind:this={link}>Download</a>
	{:else if status == 'loading'}
		<button disabled class="mt-1">Converting&nbsp;</button>
	{:else}
		<button disabled class="mt-1">Failed</button>
	{/if}

	<div class="relative">
		<select
			class={status === 'loading' ? 'opacity-0 pointer-events-none' : ''}
			bind:value={currentOutput}
			on:change={updateOutput}
		>
			{#each availableFormats as format}
				<option value={format} selected={format == currentOutput}>
					{format}
				</option>
			{/each}
		</select>
		<LoadingIndicator
			size="24px"
			color="currentColor"
			className={'!absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' +
				(status !== 'loading' ? ' opacity-0 pointer-events-none' : '')}
		/>
	</div>
</div>

<style lang="postcss">
	.split-button {
		@apply inline-flex md:flex-col lg:flex-row justify-center items-center px-2 py-4 md:py-1 gap-4 relative;
		@apply font-mono uppercase md:text-sm tracking-[1px] text-chalkboard-120 bg-green hover:hue-rotate-15;
	}

	.split-button:global(.loading),
	:global(.loading) > select {
		@apply bg-transparent;
	}
	.split-button:global(.failed),
	:global(.failed) > select {
		@apply bg-destroy-10 text-destroy-80;
	}

	select {
		@apply bg-green text-chalkboard-120;
		@apply uppercase text-sm font-mono;
		@apply shadow-inner;
		@apply pl-2 pr-3 py-1 rounded-sm;
		@apply brightness-95 border border-transparent hover:border-chalkboard-120 hover:brightness-100;
	}

	.shimmer {
		@apply relative overflow-hidden;
	}

	.shimmer::before {
		content: '';
		@apply absolute z-0 inset-0 -inset-y-1/2;
		@apply bg-gradient-to-t from-transparent via-green/80 to-transparent;
		animation: shimmer 1s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateY(100%);
		}
		100% {
			transform: translateY(-100%);
		}
	}
</style>
