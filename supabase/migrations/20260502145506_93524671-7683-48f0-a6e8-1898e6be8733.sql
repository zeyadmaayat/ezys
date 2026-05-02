
ALTER TABLE public.item_batches
  ADD CONSTRAINT item_batches_item_fk FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE,
  ADD CONSTRAINT item_batches_location_fk FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;

ALTER TABLE public.inventory_reorder_rules
  ADD CONSTRAINT reorder_item_fk FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE,
  ADD CONSTRAINT reorder_location_fk FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;

ALTER TABLE public.inventory_transfers
  ADD CONSTRAINT transfers_from_location_fk FOREIGN KEY (from_location_id) REFERENCES public.locations(id),
  ADD CONSTRAINT transfers_to_location_fk FOREIGN KEY (to_location_id) REFERENCES public.locations(id);

ALTER TABLE public.inventory_transfer_lines
  ADD CONSTRAINT transfer_lines_item_fk FOREIGN KEY (item_id) REFERENCES public.items(id);

ALTER TABLE public.cycle_count_sessions
  ADD CONSTRAINT cycle_location_fk FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;

ALTER TABLE public.cycle_count_lines
  ADD CONSTRAINT cycle_lines_item_fk FOREIGN KEY (item_id) REFERENCES public.items(id);
