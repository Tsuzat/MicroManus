<script lang="ts" module>
	export type ConfirmDeleteOptions = {
		title?: string;
		description?: string;
		skipConfirmation?: boolean;
		input?: {
			confirmationText: string;
		};
		confirm?: {
			text?: string;
		};
		cancel?: {
			text?: string;
		};
		onConfirm: () => Promise<unknown> | void;
		onCancel?: () => void;
	};

	class ConfirmDeleteState {
		open = $state(false);
		inputText = $state('');
		options = $state<ConfirmDeleteOptions | null>(null);
		loading = $state(false);

		newConfirmation(options: ConfirmDeleteOptions) {
			this.open = false;
			this.inputText = '';
			this.options = options;
			this.loading = false;
			this.open = true;
		}

		async confirm() {
			if (!this.options) return;

			if (this.options.input) {
				if (
					this.inputText.trim().toLowerCase() !==
					this.options.input.confirmationText.trim().toLowerCase()
				) {
					return;
				}
			}

			try {
				this.loading = true;
				await this.options.onConfirm();
				this.open = false;
				this.inputText = '';
			} catch (err) {
				console.error('[ConfirmDelete] Error during onConfirm:', err);
			} finally {
				this.loading = false;
			}
		}

		cancel() {
			this.options?.onCancel?.();
			this.open = false;
			this.inputText = '';
		}
	}

	const dialogState = new ConfirmDeleteState();

	export function confirmDelete(options: ConfirmDeleteOptions) {
		if (options.skipConfirmation) {
			options.onConfirm();
			return;
		}
		dialogState.newConfirmation(options);
	}
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { BarSpinner } from '$lib/components/spell/bar-spinner';

	const isMatch = $derived(
		!dialogState.options?.input ||
			dialogState.inputText.trim().toLowerCase() ===
				dialogState.options.input.confirmationText.trim().toLowerCase()
	);
</script>

<Dialog.Root bind:open={dialogState.open}>
	<Dialog.Content class="sm:max-w-[425px]">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				dialogState.confirm();
			}}
			class="flex flex-col gap-4"
		>
			<Dialog.Header>
				<Dialog.Title>
					{dialogState.options?.title ?? 'Are you sure?'}
				</Dialog.Title>
				<Dialog.Description>
					{dialogState.options?.description ?? 'This action cannot be undone.'}
				</Dialog.Description>
			</Dialog.Header>

			{#if dialogState.options?.input}
				<div class="space-y-2 py-1">
					<p class="text-xs text-muted-foreground">
						To confirm, type <span class="font-mono font-semibold text-foreground"
							>{dialogState.options.input.confirmationText}</span
						> below:
					</p>
					<Input
						bind:value={dialogState.inputText}
						placeholder={`Type "${dialogState.options.input.confirmationText}" to confirm`}
						disabled={dialogState.loading}
						class="font-mono text-sm"
						autocomplete="off"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								dialogState.confirm();
							}
						}}
					/>
				</div>
			{/if}

			<Dialog.Footer class="gap-2 pt-2 sm:gap-0">
				<Button
					type="button"
					variant="outline"
					disabled={dialogState.loading}
					onclick={() => dialogState.cancel()}
				>
					{dialogState.options?.cancel?.text ?? 'Cancel'}
				</Button>
				<Button type="submit" variant="destructive" disabled={!isMatch || dialogState.loading}>
					{#if dialogState.loading}
						<BarSpinner />
					{/if}
					{dialogState.options?.confirm?.text ?? 'Delete'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
